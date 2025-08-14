
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bot, Trophy, Users, ArrowRight, Code, Cpu, Target } from "lucide-react"
import { APP_TITLE } from "@/lib/config"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold font-headline">{APP_TITLE}</span>
            </Link>
            <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
                <Link href="/register">Get Started</Link>
            </Button>
            </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-center min-h-[calc(80vh-80px)] rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-indigo-700 p-8 shadow-2xl">
              <div className="flex flex-col justify-center space-y-4 text-center text-primary-foreground">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-black/20 px-3 py-1 text-sm font-semibold">Robotics For Everyone</div>
                  <h1 className="text-4xl font-black tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Where Innovation Meets Creation
                  </h1>
                  <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                    Join Syria's top robotics academy. Learn, build, and compete with the best. Your future in technology starts here.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg" className="font-bold bg-background text-primary hover:bg-background/90">
                    <Link href="/register">
                      Join the Academy
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Link href="/competitions">
                      Explore Competitions
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Join Us Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold font-headline">Why Join {APP_TITLE}?</h2>
                    <p className="text-muted-foreground mt-4">We provide the tools, community, and platform for students, schools, and coaches to excel in the world of robotics.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="text-center bg-card hover:bg-card/90 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full">
                                <Trophy className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">National Competitions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Showcase your skills and compete against the best teams in our nationwide robotics competitions.</p>
                        </CardContent>
                    </Card>
                    <Card className="text-center bg-card hover:bg-card/90 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                             <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Thriving Community</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Connect with peers, share ideas, and collaborate on projects within our exclusive community forum.</p>
                        </CardContent>
                    </Card>
                     <Card className="text-center bg-card hover:bg-card/90 hover:shadow-lg transition-all duration-300">
                        <CardHeader>
                            <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full">
                                <Bot className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="mt-4">Expert Coaching</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Learn from experienced coaches and access a rich library of resources to build your expertise.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold font-headline">Get Started in 3 Simple Steps</h2>
                    <p className="text-muted-foreground mt-4">Your journey into the world of robotics starts here. Follow these steps to become part of our academy.</p>
                </div>
                <div className="relative">
                    <div className="absolute top-8 left-0 w-full h-0.5 border-t border-dashed border-border -z-10 hidden md:block" />
                    <div className="grid md:grid-cols-3 gap-8 text-center relative">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">1</div>
                            <h3 className="text-xl font-semibold mb-2">Register Your Account</h3>
                            <p className="text-muted-foreground">Create your free account to get access to our community and resources.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">2</div>
                            <h3 className="text-xl font-semibold mb-2">Join or Create a Team</h3>
                            <p className="text-muted-foreground">Team up with fellow students from your school and start building.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">3</div>
                            <h3 className="text-xl font-semibold mb-2">Compete & Innovate</h3>
                            <p className="text-muted-foreground">Enter competitions, showcase your creations, and make your mark.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Our Programs Section */}
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="dark rounded-2xl bg-gradient-to-br from-blue-600 via-primary to-indigo-700 p-8 md:p-12 text-primary-foreground shadow-2xl">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold font-headline mb-4">Our Programs</h2>
                        <p className="text-primary-foreground/80 mb-12">
                           We offer a diverse range of programs designed to cater to all skill levels, from beginners to advanced roboticists.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/10 backdrop-blur-sm border border-white/10">
                            <div className="p-3 bg-primary/20 rounded-lg text-primary-foreground mb-4"><Target className="w-8 h-8"/></div>
                            <h4 className="font-semibold text-lg mb-2">VEX Competitions</h4>
                            <p className="text-primary-foreground/80 text-sm">Engage in the world-renowned VEX robotics platform, building robots to solve exciting game-based challenges.</p>
                        </div>
                         <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/10 backdrop-blur-sm border border-white/10">
                           <div className="p-3 bg-primary/20 rounded-lg text-primary-foreground mb-4"><Cpu className="w-8 h-8"/></div>
                            <h4 className="font-semibold text-lg mb-2">Arduino Workshops</h4>
                            <p className="text-primary-foreground/80 text-sm">Dive into electronics and microcontrollers with hands-on Arduino workshops for all levels.</p>
                        </div>
                         <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background/10 backdrop-blur-sm border border-white/10">
                            <div className="p-3 bg-primary/20 rounded-lg text-primary-foreground mb-4"><Code className="w-8 h-8"/></div>
                            <h4 className="font-semibold text-lg mb-2">Programming Courses</h4>
                            <p className="text-primary-foreground/80 text-sm">Master languages like Python and C++ tailored for robotics applications and logical thinking.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold font-headline">Ready to Start Your Journey?</h2>
                <p className="text-muted-foreground mt-4 mb-8 max-w-xl mx-auto">Become a part of Syria's leading robotics community today. Your future in technology starts now.</p>
                <Button size="lg" asChild>
                    <Link href="/register">Create Your Account <ArrowRight className="ml-2"/></Link>
                </Button>
            </div>
        </section>

      </main>

      <footer className="bg-secondary/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
