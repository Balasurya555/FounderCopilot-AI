export interface CommunityUser {
    id: number;
    name: string;
    startupIdea: string;
    skills: string[];
    location: string;
    lookingFor: string;
    bio: string;
}

export interface CommunityTeam {
    id: number;
    teamName: string;
    startupIdea: string;
    rolesNeeded: string[];
    description: string;
}

export interface CommunityPost {
    id: number;
    title: string;
    description: string;
    tags: string[];
    author: string;
    likes: number;
    comments: number;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export async function fetchCommunityUsers(): Promise<CommunityUser[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/community/users`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch community users", error);
        return [];
    }
}

export async function fetchCommunityTeams(): Promise<CommunityTeam[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/community/teams`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch community teams", error);
        return [];
    }
}

export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/community/posts`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch community posts", error);
        return [];
    }
}

export async function connectWithUser(targetUserId: number): Promise<boolean> {
    try {
        const res = await fetch(`${BACKEND_URL}/community/connect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUserId }),
        });
        return res.ok;
    } catch (error) {
        console.error("Failed to connect with user", error);
        return false;
    }
}

export async function createCommunityPost(title: string, description: string, tags: string[]): Promise<CommunityPost | null> {
    try {
        const res = await fetch(`${BACKEND_URL}/community/post`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, tags, author: "Alex Rivera" }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.post;
        }
        return null;
    } catch (error) {
        console.error("Failed to create post", error);
        return null;
    }
}
