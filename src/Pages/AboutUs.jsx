import React from "react";
import { Link } from "react-router-dom";
// import ParticlesBackground from "../components/HexagonsBackground"; // adjust path if needed
import HexagonBackground from "../components/HexagonBackground";

const AboutUs = () => {
  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gradient-to-r dark:from-zinc-700 dark:to-slate-900 transition-colors duration-300">
    //   <div class="bg-white  flex justify-center items-center rounded-2xl shadow-lg p-6 max-w-xl mx-auto text-gray-800">
    //     <div class="space-y-4">
    //       <p class="text-lg leading-relaxed">
    //         <span class="font-semibold text-indigo-600">QhashAi</span> is the AI
    //         innovation division of
    //         <span class="font-semibold"> QuantumHash</span>, dedicated to
    //         developing cutting-edge artificial intelligence models and
    //         solutions. Our team of researchers and engineers collaborates on a
    //         wide range of AI technologies, from machine learning and natural
    //         language processing to generative models and intelligent systems. At
    //         QhashAi, we’re driven by a mission to build smarter, more adaptive
    //         AI that can power the future of technology.
    //       </p>
    //       <div class="flex justify-between  ">
    //         <span class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
    //           <Link to="/homepage">Back</Link>
    //         </span>

    //         <a
    //           href="https://quantumhash.me"
    //           target="_blank"
    //           class="inline-block px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
    //           Explore More
    //         </a>
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div   className="relative min-h-screen flex items-center justify-center   ">
      {/* Particle Background */}
      <HexagonBackground />

      {/* Content Box */}
      <div className="bg-white bg-opacity-90 flex justify-center items-center rounded-2xl shadow-lg p-8 w-72  sm:w-[576px] mx-auto text-gray-900 z-10">
        <div className="space-y-6">
          <div className="text-xs md:text-lg leading-relaxed">
            <h1 className="font-semibold text-3xl text-indigo-600 mx-auto flex justify-center">
              QhashAi
            </h1>
            <p className="text-center">

            It is the AI innovation division of
            <span className="font-semibold"> QuantumHash</span>, dedicated to
            developing cutting-edge artificial intelligence models and
            solutions. Our team of <span className="font-semibold"> researchers,scientists and engineers</span> collaborates on a
            wide range of AI technologies, from machine learning and natural
            language processing to generative models and intelligent systems. At
            QhashAi, we’re driven by a mission to build smarter, agentic
            AI that can power the future of technology & humanity.
            </p>
          </div>
          <div className="flex justify-between">
            <Link to="/homepage" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-800 transition ">
               Back 
            </Link>

            <a
              href="https://quantumhash.me"
              target="_blank"
              rel="noreferrer"
              className="inline-block px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
              Explore More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
