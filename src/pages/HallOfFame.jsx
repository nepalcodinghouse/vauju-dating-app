import React from "react";

function HallOfFame() {
  const bugBounters = [
    {
      name: "Lil Mafia",
      contributions: 20,
      profileLink: "https://example.com/lilmafia",
      blogLink: "https://example.com/lilmafia/blog",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Hall of Fame 🏆 <br />
        <span className="text-gray-600 text-lg">
          AuraMeet – Vauju Khoj Abhiyan
        </span>
      </h1>

      <div className="grid  ml-19 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {bugBounters.map((bounter, index) => (
          <div
            key={index}
            className="border border-gray-200 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {bounter.name}
            </h2>
            <p className="text-gray-600 mb-4">
              Contributions:{" "}
              <span className="font-medium text-gray-800">
                {bounter.contributions}
              </span>
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={bounter.profileLink}
                className="text-white bg-black px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Profile
              </a>
              <a
                href={bounter.blogLink}
                className="text-white bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Blog
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HallOfFame;
