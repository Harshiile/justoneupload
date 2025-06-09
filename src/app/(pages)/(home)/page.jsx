"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function LandingPage() {
    // Array of screenshot objects with image + title + description
    const [screenshots] = useState([
        {
            src: "/invalid.jpg",
            title: "Seamless Upload Interface",
            desc: "Easily upload your videos with a clean, intuitive interface designed for speed and simplicity.",
        },
        {
            src: "/invalid.jpg",
            title: "Editor-YouTuber Sync",
            desc: "Collaborate effortlessly with real-time syncing between editors and YouTubers ensuring smooth workflow.",
        },
        {
            src: "/invalid.jpg",
            title: "Schedule & Automate",
            desc: "Plan your uploads in advance and let BullMQ handle the scheduling for perfect timed publishing.",
        },
    ]);

    const [stars, setStars] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Math.random();
            const newStar = {
                id,
                left: Math.random() * window.innerWidth,
                top: Math.random() * 50,
                duration: 1 + Math.random() * 1, // Faster, from 1s to 2s instead of 2s to 3.5s
            };
            setStars((prev) => [...prev, newStar]);

            setTimeout(() => {
                setStars((prev) => prev.filter((s) => s.id !== id));
            }, newStar.duration * 1000);
        }, 100); // Emit stars more often (every 100ms instead of 150ms)

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="bg-black text-white min-h-screen font-sans overflow-x-hidden relative w-full">
            {/* Diagonally Falling Stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    initial={{ x: star.left, y: -star.top, opacity: 1 }}
                    animate={{
                        // Increase horizontal distance traveled (steeper slope)
                        x: star.left + 350,
                        y: window.innerHeight + 300,
                        opacity: 0,
                    }}
                    transition={{ duration: star.duration, ease: "easeInOut" }}
                    className="absolute w-1 h-1 bg-white rounded-full shadow-white pointer-events-none"
                />
            ))}


            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="h-screen flex flex-col items-center justify-center text-center"
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent">
                    JustOneUpload
                </h1>
                <p className="text-lg md:text-2xl max-w-xl">
                    Revolutionizing content delivery for YouTubers & Editors with a seamless, one-click upload platform.
                </p>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 px-6 py-3 rounded-xl text-black font-semibold bg-white shadow-lg hover:bg-gray-300"
                >
                    Get Started
                </motion.button>
            </motion.section>

            {/* Fancy Screenshot Sections */}
            {screenshots.map((shot, i) => {
                // Generate random initial x and y offsets
                const randomX = (Math.random() - 0.5) * 300; // between -150 and +150 px
                const randomY = (Math.random() - 0.5) * 200; // between -100 and +100 px

                return (
                    <motion.section
                        key={i}
                        initial={{ opacity: 0, x: randomX, y: randomY }}
                        whileInView={{ opacity: 1, x: 0, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`w-full py-20 px-8 ${i % 2 === 0
                            ? "bg-gradient-to-r from-purple-900 to-black"
                            : "bg-gradient-to-l from-black to-purple-900"
                            }`}
                    >
                        <div
                            className={`flex flex-col md:flex-row items-center justify-center max-w-[1200px] mx-auto ${i % 2 === 0 ? "" : "md:flex-row-reverse"
                                }`}
                        >
                            <motion.img
                                src={shot.src}
                                alt={shot.title}
                                className="max-w-md w-full rounded-3xl shadow-2xl cursor-pointer"
                                whileHover={{ rotateY: 10, rotateX: 5, scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                            <div className="max-w-xl mx-6 text-center md:text-left text-white">
                                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
                                    {shot.title}
                                </h3>
                                <p className="text-lg text-gray-300">{shot.desc}</p>
                            </div>
                        </div>
                    </motion.section>
                );
            })}



            {/* Video Showcase */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="py-20 text-center px-6"
            >
                <h2 className="text-4xl font-bold mb-6">Watch It In Action</h2>
                <div className="flex justify-center">
                    <video controls className="rounded-xl w-full max-w-4xl shadow-2xl">
                        <source src="/videos/demo.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </motion.section>

            {/* Buzzwords Section */}
            <motion.section
                className="py-20 bg-gradient-to-t from-black to-gray-900 text-center px-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="text-3xl font-semibold mb-10">Why JustOneUpload?</h2>
                <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
                    {[
                        "One-Click Publishing",
                        "OAuth Secure Uploads",
                        "Editor-YouTuber Sync",
                        "Drive-to-YouTube",
                        "No Download Hassle",
                        "Schedule with BullMQ",
                    ].map((word, i) => (
                        <motion.div
                            key={i}
                            className="bg-white text-black px-6 py-3 rounded-full shadow-xl text-lg font-medium"
                            whileHover={{ scale: 1.1 }}
                        >
                            {word}
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Footer */}
            <footer className="text-center text-gray-500 pt-8 flex flex-col items-center gap-y-3">
                <p>© {new Date().getFullYear()} JustOneUpload. All rights reserved.</p>
                <Image
                    src='/logo.png'
                    alt="JOU LOGO"
                    width={100}
                    height={100}
                />
            </footer>
        </div>
    );
}
