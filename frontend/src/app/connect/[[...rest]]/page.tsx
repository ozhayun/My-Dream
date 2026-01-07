"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ConnectPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Redirect to home if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)] flex items-center justify-center max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sign In
          </h1>
          <p className="text-muted-foreground">
            Sign in to start managing your dreams
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-secondary/30 border border-white/10 shadow-2xl backdrop-blur-xl",
              },
            }}
            routing="path"
            path="/connect"
            signUpUrl="/connect"
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        </div>
      </motion.div>
    </div>
  );
}
