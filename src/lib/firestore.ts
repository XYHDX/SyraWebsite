

import { collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, query, where, getDoc, orderBy, limit, deleteDoc, writeBatch, runTransaction, increment, setDoc, deleteField } from "firebase/firestore";
import { db, auth } from "./firebase";
import { moderatePost } from "@/ai/flows/moderate-post-flow";
import { format } from "date-fns";


// --- COMPETITIONS ---

export const getCompetitions = async (lim?: number, upcomingOnly = false) => {
    try {
        const competitionsCol = collection(db, "competitions");
        const constraints = [];
        if (upcomingOnly) {
            constraints.push(where("status", "==", "Upcoming"));
        } else {
            constraints.push(orderBy("date", "desc"));
        }
        
        if (lim) {
            constraints.push(limit(lim));
        }

        const q = query(competitionsCol, ...constraints);
        const competitionSnapshot = await getDocs(q);
        const competitionsList = competitionSnapshot.docs.map(doc => {
            const data = doc.data();
            const date = data.date.toDate();
            return { 
                id: doc.id, 
                ...data, 
                date: format(date, "PPP"), 
            }
        }) as any[];
        
        return competitionsList.map(comp => ({ ...comp, registered: false }));
    } catch (error) {
        console.error("Error fetching competitions:", error);
        return [];
    }
}

export const getCompetitionById = async (id: string) => {
    try {
        const competitionDocRef = doc(db, "competitions", id);
        const registeredTeamsRef = collection(competitionDocRef, "registeredTeams");

        const [competitionDoc, registeredTeamsSnapshot] = await Promise.all([
            getDoc(competitionDocRef),
            getDocs(query(registeredTeamsRef, where("status", "==", "Approved")))
        ]);
        
        if (!competitionDoc.exists()) {
            return null;
        }
        const data = competitionDoc.data();
        const date = data.date.toDate();
        
        const registeredTeams = registeredTeamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const competitionData = { 
            id: competitionDoc.id, 
            ...data, 
            date: date,
            registeredTeams: registeredTeams,
        } as any;

        return competitionData;
    } catch (error) {
        console.error("Error fetching competition by ID:", error);
        return null;
    }
}

export const getPendingRegistrations = async () => {
    try {
        const competitionsSnapshot = await getDocs(collection(db, "competitions"));
        const allPendingRegistrations: any[] = [];

        for (const compDoc of competitionsSnapshot.docs) {
            const registrationsRef = collection(db, "competitions", compDoc.id, "registeredTeams");
            const pendingQuery = query(registrationsRef, where("status", "==", "Pending"));
            const pendingSnapshot = await getDocs(pendingQuery);

            pendingSnapshot.forEach(regDoc => {
                allPendingRegistrations.push({
                    id: regDoc.id,
                    competitionId: compDoc.id,
                    competitionName: compDoc.data().name,
                    ...regDoc.data()
                });
            });
        }
        return allPendingRegistrations;
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        return [];
    }
}


// --- SCHOOLS ---

export const getSchools = async () => {
     try {
        const schoolsQuery = query(collection(db, "schools"), orderBy("name"));
        const coachesQuery = query(collection(db, "coaches"));

        const [schoolSnapshot, coachSnapshot] = await Promise.all([
            getDocs(schoolsQuery),
            getDocs(coachesQuery)
        ]);

        const coachesBySchool: { [key: string]: { id: string; name: string }[] } = {};
        coachSnapshot.forEach(doc => {
            const coach = doc.data();
            if (coach.school) {
                if (!coachesBySchool[coach.school]) {
                    coachesBySchool[coach.school] = [];
                }
                coachesBySchool[coach.school].push({ id: doc.id, name: coach.name });
            }
        });

        return schoolSnapshot.docs.map(doc => {
            const school = doc.data();
            return {
                id: doc.id,
                ...school,
                coaches: coachesBySchool[school.name] || [],
            };
        });
    } catch (error) {
        console.error("Error fetching schools:", error);
        return [];
    }
}

export const getSchoolById = async (id: string) => {
    try {
        const schoolDoc = await getDoc(doc(db, "schools", id));
        if (!schoolDoc.exists()) {
            return null;
        }
        return { id: schoolDoc.id, ...schoolDoc.data() };
    } catch (error) {
        console.error("Error fetching school by ID:", error);
        return null;
    }
}

export const getSchoolByName = async (name: string) => {
    try {
        if (!name || name === 'Not Set') return null;
        const q = query(collection(db, "schools"), where("name", "==", name), limit(1));
        const schoolSnapshot = await getDocs(q);
        if (schoolSnapshot.empty) {
            return null;
        }
        const schoolDoc = schoolSnapshot.docs[0];
        return { id: schoolDoc.id, ...schoolDoc.data() };
    } catch (error) {
        console.error("Error fetching school by name:", error);
        return null;
    }
};


// --- COACHES ---

export const getCoaches = async () => {
    try {
        const coachesCol = collection(db, "coaches");
        const coachQuery = query(coachesCol, orderBy("name"));
        const coachSnapshot = await getDocs(coachQuery);
        return coachSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            avatar: doc.data().avatar || "https://placehold.co/100x100.png",
            expertise: doc.data().expertise || ""
        }));
    } catch (error) {
        console.error("Error fetching coaches:", error);
        return [];
    }
}

export const getCoachesBySchool = async (schoolName: string) => {
    try {
        if (!schoolName) return [];
        const coachesCol = collection(db, "coaches");
        const q = query(coachesCol, where("school", "==", schoolName), orderBy("name"));
        const coachSnapshot = await getDocs(q);
        return coachSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            avatar: doc.data().avatar || "https://placehold.co/100x100.png"
        }));
    } catch (error) {
        console.error("Error fetching coaches by school:", error);
        return [];
    }
}

export const getCoachById = async (id: string) => {
    try {
        const coachDoc = await getDoc(doc(db, "coaches", id));
        if (!coachDoc.exists()) {
           return null;
        }
        const coachData = coachDoc.data();
        const schoolData = await getSchoolByName(coachData.school);
        return { 
            id: coachDoc.id, 
            name: coachData.name,
            school: coachData.school,
            schoolId: schoolData?.id,
            avatar: coachData.avatar || "https://placehold.co/100x100.png",
            expertise: coachData.expertise || "",
            about: coachData.about || ""
        };
    } catch (error) {
        console.error("Error fetching coach by ID:", error);
        return null;
    }
}

export async function updateCoachProfile(coachId: string, data: { about: string; expertise: string; }) {
    const user = auth.currentUser;
    if (!user || user.uid !== coachId) {
        throw new Error("You are not authorized to edit this profile.");
    }
    if (!coachId) throw new Error("Coach ID is required.");

    try {
        const coachRef = doc(db, "coaches", coachId);
        
        const coachUpdateData = {
            about: data.about,
            expertise: data.expertise
        };
        
        await updateDoc(coachRef, coachUpdateData);

    } catch (error) {
        console.error("Error updating coach profile:", error);
        throw new Error("Could not update coach profile. Please try again.");
    }
}


// --- POSTS ---

export const getPosts = async (status?: "Approved" | "Pending" | "All", lim?: number, authorId?: string) => {
    try {
        const postsCol = collection(db, "posts");
        const constraints = [];
        if (status && status !== "All") {
            constraints.push(where("status", "==", status));
        }
        if (authorId) {
            constraints.push(where("authorId", "==", authorId));
        }

        constraints.push(orderBy("createdAt", "desc"));
        
        if (lim) {
            constraints.push(limit(lim));
        }
        
        const finalQuery = query(postsCol, ...constraints);


        const postSnapshot = await getDocs(finalQuery);
        
        const posts = await Promise.all(postSnapshot.docs.map(async (postDoc) => {
            const data = postDoc.data();
            
            return { 
                id: postDoc.id, 
                ...data,
                time: data.createdAt ? format(data.createdAt.toDate(), "PP") : 'Just now',
                author: data.authorName || 'Deleted User',
                handle: data.authorHandle || '@deleted',
                avatar: data.authorAvatar || "https://placehold.co/100x100.png",
                comments: data.comments?.sort((a: any, b: any) => a.createdAt.toDate() - b.createdAt.toDate()).map((c: any) => ({ ...c, createdAt: c.createdAt.toDate() })) || [],
            };
        }));

        const user = auth.currentUser;
        if (user && status === 'Approved') {
            const likedPostsPromises = posts.map(post => isPostLikedByUser(post.id, user.uid));
            const likedStatuses = await Promise.all(likedPostsPromises);
            return posts.map((post, index) => ({
                ...post,
                liked: likedStatuses[index]
            }));
        }

        return posts;

    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

export async function createPost(content: string, imageUrl?: string, imageHint?: string) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to create a post.");
    }
    if (!user.displayName) {
        throw new Error("You must set a display name in your profile before posting.");
    }


    try {
        const moderationResult = await moderatePost({ content });
        if (moderationResult.isHarmful) {
            throw new Error(`Post violates our content policy: ${moderationResult.reason}. Please revise and try again.`);
        }

        await addDoc(collection(db, "posts"), {
            authorId: user.uid,
            authorName: user.displayName,
            authorHandle: user.email ? `@${user.email.split('@')[0]}` : `@${user.uid}`,
            authorAvatar: user.photoURL || "https://placehold.co/100x100.png",
            content: content,
            image: imageUrl,
            imageHint,
            likes: 0,
            comments: [],
            createdAt: serverTimestamp(),
            status: "Pending",
        });
    } catch (error: any) {
        console.error("Error creating post:", error);
        throw new Error(error.message || "Could not create post. Please try again.");
    }
}


// --- USERS ---

export const getUsers = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.warn("Attempted to get all users without authentication.");
        return [];
    }

    try {
        const usersCol = collection(db, "users");
        const userSnapshot = await getDocs(query(usersCol, orderBy("name")));
        const users = await Promise.all(userSnapshot.docs.map(async (doc) => {
            const userData = doc.data();
            if (userData.role === 'School Admin' && userData.schoolId) {
                const schoolDoc = await getSchoolById(userData.schoolId);
                userData.schoolName = schoolDoc?.name || 'Unknown School';
            }
            return { id: doc.id, ...userData };
        }));
        return users as any[];
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}


export const getUserById = async (id: string) => {
    try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (!userDoc.exists()) {
            return null;
        }
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
};

export const getStudentsBySchool = async (schoolName: string) => {
    try {
        if (!schoolName) return [];
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("school", "==", schoolName), where("role", "==", "Student"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching students by school:", error);
        return [];
    }
}

// --- CONTRIBUTORS ---
export const getContributors = async () => {
    try {
        const usersSnapshot = await getDocs(query(collection(db, "users"), where("contributions", ">", 0), orderBy("contributions", "desc"), limit(4)));
        
        return usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                handle: data.email?.split('@')[0] || doc.id,
                name: data.name || "Anonymous",
                avatar: data.avatarUrl || "https://placehold.co/100x100.png",
                contributions: data.contributions || 0,
                role: data.role
            };
        });

    } catch (error) {
        console.error("Error fetching contributors:", error);
        return [];
    }
}

// --- TEAMS ---

export const getTeams = async () => {
    try {
        const teamsCol = collection(db, "teams");
        const q = query(teamsCol, orderBy("createdAt", "desc"));
        const teamSnapshot = await getDocs(q);
        return teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching teams:", error);
        return [];
    }
};

export const getTeamsBySchool = async (schoolId: string) => {
    try {
        if (!schoolId) return [];
        const teamsCol = collection(db, "teams");
        const q = query(teamsCol, where("schoolId", "==", schoolId), orderBy("name"));
        const teamSnapshot = await getDocs(q);
        return teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching teams by school:", error);
        return [];
    }
};

export const getTeamsForCoach = async (coachId: string) => {
    if (!coachId) return [];
    try {
        const teamsRef = collection(db, "teams");
        const q = query(teamsRef, where("coachId", "==", coachId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching teams for coach:", error);
        return [];
    }
}

export const getTeamMembers = async (memberIds: string[]) => {
    if (!memberIds || memberIds.length === 0) return [];
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("__name__", "in", memberIds));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
}


export async function createTeam(data: { name: string; schoolId: string; schoolName: string, coachId: string, coachName: string, members?: string[] }) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to create a team.");
    }
    
    const userProfile = await getUserById(user.uid);
    if (userProfile?.role !== 'Admin' && userProfile?.role !== 'Coach') {
      throw new Error("You are not authorized to create a team.");
    }
    
    try {
        const docRef = await addDoc(collection(db, "teams"), {
            name: data.name,
            schoolId: data.schoolId,
            schoolName: data.schoolName,
            coachId: data.coachId,
            coachName: data.coachName,
            members: data.members || [],
            createdAt: serverTimestamp(),
            createdBy: user.uid,
        });

        // Add the team to the school's subcollection of teams
        const schoolTeamRef = doc(db, `schools/${data.schoolId}/teams`, docRef.id);
        await setDoc(schoolTeamRef, { teamName: data.name, coachName: data.coachName });


    } catch (error) {
        console.error("Error creating team:", error);
        throw new Error("Could not create team. Please try again.");
    }
}

export async function addMembersToTeam(teamId: string, studentIds: string[]) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to add members.");
    }
     if (!teamId || !studentIds || studentIds.length === 0) {
        throw new Error("Team ID and student IDs are required.");
    }
    
    try {
        const teamRef = doc(db, "teams", teamId);
        await updateDoc(teamRef, {
            members: arrayUnion(...studentIds)
        });
    } catch (error) {
        console.error("Error adding members to team:", error);
        throw new Error("Could not add members to the team. Please try again.");
    }
}

export async function deleteTeam(id: string, schoolId: string) {
    if (!id || !schoolId) throw new Error("Team ID and School ID are required.");
    try {
        const batch = writeBatch(db);
        
        // Delete the main team document
        const teamRef = doc(db, "teams", id);
        batch.delete(teamRef);

        // Delete the team reference from the school's subcollection
        const schoolTeamRef = doc(db, `schools/${schoolId}/teams`, id);
        batch.delete(schoolTeamRef);

        await batch.commit();

    } catch (error) {
        console.error("Error deleting team:", error);
        throw new Error("Could not delete team. Please try again.");
    }
}


// --- USER ACTIONS ---

export async function registerTeamForCompetition(competitionId: string, team: { id: string, name: string, coachName: string }) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to register a team.");
    }
     if (!competitionId || !team?.id) {
        throw new Error("Competition and Team information is required.");
    }

    try {
        const registrationRef = doc(db, "competitions", competitionId, "registeredTeams", team.id);
        const registrationSnap = await getDoc(registrationRef);

        if (registrationSnap.exists()) {
            throw new Error("This team is already registered or pending approval for this competition.");
        }
        
        await setDoc(registrationRef, {
            teamName: team.name,
            coachName: team.coachName,
            status: "Pending",
            registeredAt: serverTimestamp(),
            registeredBy: user.uid,
        });
    } catch (error: any) {
        console.error("Error registering team for competition:", error);
        throw new Error(error.message || "Could not register team. Please try again.");
    }
}


export async function isPostLikedByUser(postId: string, userId: string) {
    const likeDocRef = doc(db, "posts", postId, "likes", userId);
    const likeDoc = await getDoc(likeDocRef);
    return likeDoc.exists();
}

export async function togglePostLike(postId: string, userId: string) {
    const postRef = doc(db, "posts", postId);
    const likeRef = doc(postRef, "likes", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling post like:", error);
        throw new Error("Could not update like status. Please try again.");
    }
}

export async function addCommentToPost(postId: string, commentText: string) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to comment.");
    }
    if (!user.displayName) {
        throw new Error("You must have a display name to comment.")
    }

    if (!commentText.trim()) {
        throw new Error("Comment cannot be empty.");
    }

    const postRef = doc(db, "posts", postId);
    const newComment = {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL,
        text: commentText,
        createdAt: new Date(),
    };

    try {
        await runTransaction(db, async (transaction) => {
            transaction.update(postRef, {
                comments: arrayUnion(newComment)
            });

            const userRef = doc(db, "users", user.uid);
            transaction.update(userRef, { contributions: increment(1) });
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        throw new Error("Could not add comment. Please try again.");
    }
}



// --- ADMIN ACTIONS ---

export async function createCompetition(data: { name: string; date: Date; description: string; }) {
    try {
        await addDoc(collection(db, "competitions"), {
            ...data,
            status: new Date(data.date) >= new Date(new Date().setHours(0,0,0,0)) ? "Upcoming" : "Completed",
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating competition:", error);
        throw new Error("Could not create competition. Please try again.");
    }
}

export async function updateCompetition(id: string, data: { name: string; date: Date; description: string; }) {
    if (!id) throw new Error("Competition ID is required.");
    try {
        const compRef = doc(db, "competitions", id);
        await updateDoc(compRef, {
            ...data,
            status: new Date(data.date) >= new Date(new Date().setHours(0,0,0,0)) ? "Upcoming" : "Completed",
        });
    } catch (error) {
        console.error("Error updating competition:", error);
        throw new Error("Could not update competition. Please try again.");
    }
}

export async function deleteCompetition(id: string) {
    if (!id) throw new Error("Competition ID is required.");
    try {
        const compRef = doc(db, "competitions", id);
        await deleteDoc(compRef);
    } catch (error) {
        console.error("Error deleting competition:", error);
        throw new Error("Could not delete competition. Please try again.");
    }
}

export async function approveRegistration(competitionId: string, teamId: string) {
    if (!competitionId || !teamId) {
        throw new Error("Competition and Team IDs are required.");
    }
    try {
        const regRef = doc(db, "competitions", competitionId, "registeredTeams", teamId);
        await updateDoc(regRef, { status: "Approved" });

        // Optional: Increment team count on the competition document
        const compRef = doc(db, "competitions", competitionId);
        await updateDoc(compRef, { teams: increment(1) });
        
    } catch (error) {
        console.error("Error approving registration:", error);
        throw new Error("Could not approve registration.");
    }
}

export async function denyRegistration(competitionId: string, teamId: string) {
     if (!competitionId || !teamId) {
        throw new Error("Competition and Team IDs are required.");
    }
    try {
        const regRef = doc(db, "competitions", competitionId, "registeredTeams", teamId);
        await deleteDoc(regRef);
    } catch (error) {
        console.error("Error denying registration:", error);
        throw new Error("Could not deny registration.");
    }
}


export async function approvePost(postId: string) {
    if (!postId) {
        throw new Error("Post ID is required to approve a post.");
    }
    const postRef = doc(db, "posts", postId);
    
    try {
         await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Document does not exist!";
            }
            
            transaction.update(postRef, { status: "Approved" });

            const authorId = postDoc.data().authorId;
            if (authorId) {
                const authorRef = doc(db, "users", authorId);
                transaction.update(authorRef, { contributions: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error approving post:", error);
        throw new Error("Could not approve post. Please try again.");
    }
}


export async function deletePost(postId: string) {
    if (!postId) {
        throw new Error("Post ID is required to delete a post.");
    }
    try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
    } catch (error) {
        console.error("Error deleting post:", error);
        throw new Error("Could not delete post. Please try again.");
    }
}

export async function deleteUser(userId: string, userName: string) {
     if (!userId) {
        throw new Error("User ID is required to delete a user.");
    }
    // IMPORTANT: This function only deletes Firestore data.
    // The user must still be manually deleted from Firebase Authentication.
    try {
        const batch = writeBatch(db);

        // 1. Delete user document
        const userRef = doc(db, "users", userId);
        batch.delete(userRef);

        // 2. Delete coach document if it exists
        const coachRef = doc(db, "coaches", userId);
        const coachSnap = await getDoc(coachRef);
        if (coachSnap.exists()) {
            batch.delete(coachRef);
        }

        // 3. Delete all posts by the user
        const postsQuery = query(collection(db, "posts"), where("authorId", "==", userId));
        const postsSnapshot = await getDocs(postsQuery);
        postsSnapshot.forEach(postDoc => {
            batch.delete(postDoc.ref);
        });
        
        console.log(`User ${userId} data deleted from Firestore. MANUAL DELETION REQUIRED IN FIREBASE AUTHENTICATION.`);

        await batch.commit();

    } catch (error) {
        console.error("Error deleting user and their content:", error);
        throw new Error("Could not delete user's Firestore data. Please try again.");
    }
}


export async function promoteUserToCoach(userId: string) {
    if (!userId) {
        throw new Error("User ID is required to promote a user.");
    }
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User to promote not found.");
        }

        const userData = userSnap.data();
        
        const batch = writeBatch(db);

        batch.update(userRef, {
            role: "Coach"
        });

        const coachRef = doc(db, "coaches", userId);
        batch.set(coachRef, {
            name: userData.name,
            school: userData.school || 'Unaffiliated',
            avatar: userData.avatarUrl || "https://placehold.co/100x100.png",
            expertise: "VEX, Arduino, Python",
            about: `An experienced coach from ${userData.school || 'the community'}.`,
        });

        // Also update the school's primary coach if the school is valid
        if (userData.school && userData.school !== 'Unaffiliated' && userData.school !== 'Not Set') {
            const schoolData = await getSchoolByName(userData.school);
            if (schoolData) {
                const schoolRef = doc(db, "schools", schoolData.id);
                batch.update(schoolRef, { coach: userData.name });
            }
        }
        
        await batch.commit();
        
    } catch (error) {
        console.error("Error promoting user:", error);
        throw new Error("Could not promote user. Please try again.");
    }
}

export async function demoteCoach(userId: string) {
    if (!userId) {
        throw new Error("User ID is required to demote a coach.");
    }
    try {
        const userRef = doc(db, "users", userId);
        const coachRef = doc(db, "coaches", userId);

        const batch = writeBatch(db);
        batch.update(userRef, { role: "Student" });
        batch.delete(coachRef);
        
        await batch.commit();
        
    } catch (error) {
        console.error("Error demoting coach:", error);
        throw new Error("Could not demote coach. Please try again.");
    }
}

export async function promoteUserToSchoolAdmin(userId: string, schoolId: string, schoolName: string) {
    if (!userId || !schoolId) {
        throw new Error("User ID and School ID are required.");
    }
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) throw new Error("User not found");
        
        const schoolRef = doc(db, "schools", schoolId);
        
        const batch = writeBatch(db);

        batch.update(userRef, {
            role: "School Admin",
            schoolId: schoolId,
            school: schoolName,
        });

        batch.update(schoolRef, {
            adminId: userId,
        });

        await batch.commit();

    } catch (error) {
        console.error("Error promoting user to School Admin:", error);
        throw new Error("Could not promote user. Please try again.");
    }
}

export async function demoteSchoolAdmin(userId: string) {
    if (!userId) {
        throw new Error("User ID is required to demote a School Admin.");
    }
    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error("User to demote not found.");
        }
        
        const userData = userSnap.data();
        const schoolId = userData.schoolId;

        const batch = writeBatch(db);
        
        // Update user: set role to student, remove schoolId
        batch.update(userRef, { 
            role: "Student", 
            schoolId: deleteField() 
        });

        // If a school was linked, remove the adminId from it
        if (schoolId) {
            const schoolRef = doc(db, "schools", schoolId);
            const schoolSnap = await getDoc(schoolRef);
            if (schoolSnap.exists() && schoolSnap.data().adminId === userId) {
                batch.update(schoolRef, { 
                    adminId: deleteField() 
                });
            }
        }
        
        await batch.commit();
        
    } catch (error) {
        console.error("Error demoting School Admin:", error);
        throw new Error("Could not demote School Admin. Please try again.");
    }
}

export async function createSchool(data: { name: string; location: string; about?: string; }) {
    try {
        await addDoc(collection(db, "schools"), {
            ...data,
            about: data.about || "",
            coach: "Not Assigned",
            teams: 0,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error creating school:", error);
        throw new Error("Could not create school. Please try again.");
    }
}

export async function updateSchool(id: string, data: { name: string; location: string; about?: string; }) {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("You must be logged in to update a school.");
    }
    if (!id) throw new Error("School ID is required.");

    try {
        const userProfile = await getUserById(user.uid);
         if (userProfile?.role !== 'Admin' && (userProfile?.role !== 'School Admin' || userProfile?.schoolId !== id)) {
             throw new Error("You are not authorized to edit this school.");
        }

        const schoolRef = doc(db, "schools", id);
        await updateDoc(schoolRef, data);
    } catch (error: any) {
        console.error("Error updating school:", error);
        throw new Error(error.message || "Could not update school. Please try again.");
    }
}

export async function deleteSchool(id: string) {
    if (!id) throw new Error("School ID is required.");
    try {
        await deleteDoc(doc(db, "schools", id));
    } catch (error) {
        console.error("Error deleting school:", error);
        throw new Error("Could not delete school. Please try again.");
    }
}
