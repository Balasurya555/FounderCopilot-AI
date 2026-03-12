import React, { useState, useEffect } from "react";
import { Users, Briefcase, MessageSquare, Send, CheckCircle2, UserPlus, Flame } from "lucide-react";
import {
    fetchCommunityUsers,
    fetchCommunityTeams,
    fetchCommunityPosts,
    connectWithUser,
    createCommunityPost,
    CommunityUser,
    CommunityTeam,
    CommunityPost
} from "../services/communityService";
import { StartupData } from "../lib/mockData";
import { cn } from "../lib/utils";

interface CommunityProps {
    startupData: StartupData | null;
}

export default function Community({ startupData }: CommunityProps) {
    const [users, setUsers] = useState<CommunityUser[]>([]);
    const [teams, setTeams] = useState<CommunityTeam[]>([]);
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [activeTab, setActiveTab] = useState<"discover" | "teams" | "feed">("feed");

    // Feed Form State
    const [postTitle, setPostTitle] = useState(startupData?.startup_name || "");
    const [postDesc, setPostDesc] = useState(startupData?.idea_summary || "");
    const [postTags, setPostTags] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    // Connection State
    const [pendingConnections, setPendingConnections] = useState<Set<number>>(new Set());
    const [joinedTeams, setJoinedTeams] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [u, t, p] = await Promise.all([
            fetchCommunityUsers(),
            fetchCommunityTeams(),
            fetchCommunityPosts()
        ]);
        setUsers(u);
        setTeams(t);
        setPosts(p);
    };

    const handleConnect = async (userId: number) => {
        setPendingConnections(prev => new Set(prev).add(userId));
        await connectWithUser(userId);
    };

    const handleJoinTeam = (teamId: number) => {
        setJoinedTeams(prev => new Set(prev).add(teamId));
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postTitle.trim() || !postDesc.trim()) return;
        setIsPosting(true);

        const tagsArray = postTags.split(',').map(t => t.trim()).filter(t => t);
        const newPost = await createCommunityPost(postTitle, postDesc, tagsArray);

        if (newPost) {
            setPosts(prev => [newPost, ...prev]);
            setPostTitle("");
            setPostDesc("");
            setPostTags("");
        }
        setIsPosting(false);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Startup Community</h1>
                    <p className="text-slate-500 mt-1">Connect with founders, form teams, and share ideas.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {[
                        { id: "discover", label: "Founders", icon: Users },
                        { id: "teams", label: "Teams", icon: Briefcase },
                        { id: "feed", label: "Feed", icon: MessageSquare }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab.id
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "discover" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => (
                        <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-indigo-200 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
                                    <p className="text-xs text-slate-500">{user.location}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            </div>
                            <p className="text-sm text-slate-700 font-medium mb-1">Building: {user.startupIdea}</p>
                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-8">{user.bio}</p>

                            <div className="mb-6 flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.skills.map(s => (
                                        <span key={s} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Looking For</p>
                                    <p className="text-xs font-bold text-indigo-600">{user.lookingFor}</p>
                                </div>
                                <button
                                    onClick={() => handleConnect(user.id)}
                                    disabled={pendingConnections.has(user.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                        pendingConnections.has(user.id)
                                            ? "bg-slate-100 text-slate-400"
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                                    )}
                                >
                                    {pendingConnections.has(user.id) ? (
                                        <><CheckCircle2 className="w-3 h-3" /> Pending</>
                                    ) : (
                                        <><UserPlus className="w-3 h-3" /> Connect</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "teams" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {teams.map(team => (
                        <div key={team.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                                    {team.teamName.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900">{team.teamName}</h3>
                                    <p className="text-xs font-medium text-slate-500">{team.startupIdea}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed mb-6">
                                {team.description}
                            </p>
                            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Roles Needed</p>
                                <div className="flex flex-col gap-2">
                                    {team.rolesNeeded.map(role => (
                                        <div key={role} className="flex items-center gap-2 text-sm font-medium text-slate-700 before:content-[''] before:w-1.5 before:h-1.5 before:bg-indigo-500 before:rounded-full">
                                            {role}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoinTeam(team.id)}
                                disabled={joinedTeams.has(team.id)}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-bold transition-all",
                                    joinedTeams.has(team.id)
                                        ? "bg-green-50 text-green-600 border border-green-200"
                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                                )}
                            >
                                {joinedTeams.has(team.id) ? "Request Sent" : "Request to Join Team"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "feed" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" /> Share your Idea
                            </h3>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Startup Title"
                                        value={postTitle}
                                        onChange={(e) => setPostTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-900"
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Describe your idea or what you need help with..."
                                        value={postDesc}
                                        onChange={(e) => setPostDesc(e.target.value)}
                                        rows={4}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Tags (comma separated)"
                                        value={postTags}
                                        onChange={(e) => setPostTags(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPosting || !postTitle.trim() || !postDesc.trim()}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isPosting ? "Posting..." : <><Send className="w-4 h-4" /> Publish to Feed</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {posts.map(post => (
                            <div key={post.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs">
                                        {post.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{post.author}</h4>
                                        <p className="text-[10px] text-slate-400">Just now</p>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed mb-6">{post.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                            <Flame className="w-4 h-4" /> {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                            <MessageSquare className="w-4 h-4" /> {post.comments}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                                        <button
                                            onClick={() => alert("Added to team waitlist: " + post.title)}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
                                        >
                                            Join Team
                                        </button>
                                        <button
                                            onClick={() => alert("Opening feedback module...")}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                                        >
                                            Provide Feedback
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                No posts yet. Be the first to share an idea!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
