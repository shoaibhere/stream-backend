import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Video,
  Search,
  FileText,
  Calendar,
  Shield,
  LogIn,
  Camera,
  Clock,
  History
} from "lucide-react";
import Link from "next/link";

const Index = () => {
  const features = [
  {
    icon: <LogIn className="h-8 w-8" />,
    title: "Login & Signup",
    description:
      "Create your profile with picture and personalized bio to connect with fellow fans",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Change Password",
    description:
      "Easy account management with secure password updates in your settings",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Football Forums",
    description:
      "Like and reply to match discussions with passionate football community",
  },
  {
    icon: <Video className="h-8 w-8" />,
    title: "Live Match Streaming",
    description:
      "High-quality live streaming of matches with crystal clear playback",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Create Your Own Match",
    description:
      "Set up custom matches with teams and players, track goals and cards live, and view your match history anytime",
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "Search Players & Teams",
    description:
      "Comprehensive database to find your favorite players and teams instantly",
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "News Articles",
    description:
      "Stay updated with latest football news, transfers, and match reports",
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Live Scores & Stats",
    description:
      "Real-time scores, league tables, fixtures, and league statistics",
  },
  {
  icon: <History className="h-8 w-8" />,
  title: "Match History",
  description:
    "Review previously created matches with full stats, team details, and time logs anytime from your profile.",
},
];


  const screenshots = [
  { id: 1, src:'/sc2.png', alt: "App Dashboard" },
  { id: 2, src:'/sc3.png', alt: "Live Streaming" },
  { id: 3, src:'/sc4.png', alt: "Forums" },
  { id: 4, src:'/sc5.png', alt: "Player Search" },
];


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 text-lg px-6 py-2">
              ⚽ The Ultimate Football Experience
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Kickstro<span className="text-green-400">Naut</span>
            </h1>
            <p className="text-2xl md:text-3xl text-green-100 mb-8 font-medium">
              Stream. Discuss. Celebrate Football.
            </p>
            <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
              Join millions of football fans worldwide. Watch live matches,
              engage in discussions, and stay updated with the latest news and
              statistics.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <a href="/kickstronaut.apk" download>
                📱 Download APK
              </a>
            </Button>
          </div>
        </div>

        {/* Floating Football Icons */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">
          ⚽
        </div>
        <div className="absolute top-40 right-20 text-4xl opacity-30 animate-pulse">
          🏆
        </div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-25">🥅</div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to enjoy football to the fullest. From live
              streaming to community discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-500"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Preview Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-green-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              App Preview
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Get a glimpse of our beautiful, intuitive interface designed for
              the ultimate football experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
  {screenshots.map((screenshot) => (
    <div key={screenshot.id} className="group">
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-8 shadow-2xl transform group-hover:scale-105 transition-all duration-300">
        <div className="bg-white rounded-xl py-2 h-72 flex items-center justify-center overflow-hidden">
          <div className="text-center w-full h-full">
            <img 
              src={screenshot.src} 
              alt={screenshot.alt}
              className="w-full h-full object-contain"
            />
            {!screenshot.src && (
              <>
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  {screenshot.alt}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Join the Action?
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Download our app now and become part of the world's most
              passionate football community.
            </p>

            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 shadow-2xl">
              <h3 className="text-3xl font-bold text-white mb-6">
                Get the App Now!
              </h3>
              <p className="text-green-100 mb-8 text-lg">
                Free download • No subscription required • Available for Android
              </p>
              <Button
                asChild
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <a href="/kickstronaut.apk" download>
                  📱 Download APK
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white">
                Kickstro<span className="text-green-400">Naut</span>
              </h3>
              <p className="text-gray-400 mt-2">
                Stream. Discuss. Celebrate Football.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="text-green-400 hover:text-green-300 transition-colors duration-300 font-medium"
              >
                Admin Login
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Kickstronaut. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
