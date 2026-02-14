"use client";

import { useCallback } from "react";

// Background Music Tracks
// Note: For custom music, add MP3 files to /public/music/ and use "/music/filename.mp3"
const MUSIC_TRACKS = {
  // Soft ambient for pre-game romance
  romantic: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
  
  // Upbeat energetic for game levels  
  game: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  
  // Celebratory for victory/treasure
  victory: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
};

export type MusicType = "romantic" | "game" | "victory";

interface MusicManager {
  playMusic: (type: MusicType) => void;
  stopMusic: () => void;
  fadeToTrack: (type: MusicType) => void;
  setVolume: (volume: number) => void;
  isPlaying: () => boolean;
}

// Singleton audio element to share across components
let audioElement: HTMLAudioElement | null = null;
let currentType: MusicType | null = null;

function getAudioElement(): HTMLAudioElement {
  if (typeof window === "undefined") {
    return null as unknown as HTMLAudioElement;
  }
  
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = 0.5;
  }
  return audioElement;
}

export function useBackgroundMusic(): MusicManager {
  const playMusic = useCallback((type: MusicType) => {
    const audio = getAudioElement();
    if (!audio) return;

    // Don't restart if same track
    if (currentType === type && !audio.paused) {
      return;
    }

    // Set new source and play
    audio.src = MUSIC_TRACKS[type];
    audio.load();
    audio.play().catch(() => {});
    
    currentType = type;
  }, []);

  const stopMusic = useCallback(() => {
    const audio = getAudioElement();
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    currentType = null;
  }, []);

  const fadeToTrack = useCallback((type: MusicType) => {
    const audio = getAudioElement();
    if (!audio) return;

    // Don't change if same track
    if (currentType === type && !audio.paused) return;

    // Simple crossfade
    const fadeOut = setInterval(() => {
      if (audio.volume > 0.1) {
        audio.volume -= 0.1;
      } else {
        clearInterval(fadeOut);
        audio.src = MUSIC_TRACKS[type];
        audio.load();
        audio.volume = 0;
        audio.play().catch(console.log);
        
        const fadeIn = setInterval(() => {
          if (audio.volume < 0.5) {
            audio.volume += 0.1;
          } else {
            clearInterval(fadeIn);
          }
        }, 100);
        
        currentType = type;
      }
    }, 100);
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = getAudioElement();
    if (audio) {
      audio.volume = volume;
    }
  }, []);

  const isPlaying = useCallback(() => {
    const audio = getAudioElement();
    return audio ? !audio.paused : false;
  }, []);

  return {
    playMusic,
    stopMusic,
    fadeToTrack,
    setVolume,
    isPlaying,
  };
}
