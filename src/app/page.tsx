'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import { fetchAlbumArt } from "../utils/spotify";

export default function Home() {
  interface Vinyl {
    Title: string;
    image?: string;
  }

  const [vinylList, setVinylList] = useState<Vinyl[]>([]);
  const [vinyl, setVinyl] = useState<Vinyl | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("/albumArt/default.jpg");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedVinylList, setEditedVinylList] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    const fetchVinylList = async () => {
      const response = await fetch("/vinylList.json");
      const data = await response.json();
      setVinylList(data);
      setEditedVinylList(JSON.stringify(data, null, 2));
    };
    fetchVinylList();
  }, []);

  const fetchRandomVinyl = async () => {
    const randomVinyl = vinylList[Math.floor(Math.random() * vinylList.length)];
    setVinyl(randomVinyl);

    // Fetch album art from Spotify
    const albumArt = await fetchAlbumArt(randomVinyl.Title);
    setImageSrc(albumArt || "/albumArt/default.jpg"); // Ensure fallback
  };

  const saveEdits = async () => {
    try {
      const updatedList = JSON.parse(editedVinylList);
      const response = await fetch("/api/updateVinylList", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          updatedVinylList: updatedList,
        }),
      });

      if (response.ok) {
        setVinylList(updatedList);
        setIsEditing(false);
        alert("Vinyl list updated successfully!");
      } else if (response.status === 401) {
        alert("Unauthorized: Incorrect password.");
      } else {
        alert("Failed to update the vinyl list.");
      }
    } catch (error) {
      alert("Invalid JSON format." + error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Random Vinyl Picker</h1>
      {isEditing ? (
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Edit Vinyl List</h2>
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editedVinylList}
            onChange={(e) => setEditedVinylList(e.target.value)}
          />
          <input
            type="password"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={saveEdits}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          {vinyl ? (
            <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{vinyl.Title}</h2>
              <Image
                src={imageSrc}
                alt={vinyl?.Title || "Default Album Art"}
                width={300}
                height={300}
                className="rounded-lg"
              />
            </div>
          ) : (
            <p className="text-lg text-gray-600 mb-4">Click the button to pick a vinyl!</p>
          )}
          <button
            onClick={fetchRandomVinyl}
            className="mt-6 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Pick a Random Vinyl
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300"
          >
            Edit Vinyl List
          </button>
        </>
      )}
    </div>
  );
}
