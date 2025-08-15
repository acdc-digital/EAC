import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, ArrowUp, Award, Clock, FileText, Lightbulb, MessageCircle, Plus, Share, Sparkles, TrendingUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface RedditPostData {
  title: string;
  content: string;
  subreddit: string;
  flair: string;
  postType: 'text' | 'link' | 'image';
  url?: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledTime?: string;
}

interface PostStats {
  upvotes: number;
  downvotes: number;
  comments: number;
  awards: number;
  shares: number;
  votes: number; // net votes (upvotes - downvotes)
  upvotePercentage: number;
  trending: boolean;
  postedTime: string;
}

interface NewRedditPostEditorProps {
  isVisible: boolean;
  onClose: () => void;
}

export function NewRedditPostEditor({ isVisible, onClose }: NewRedditPostEditorProps) {
  const [postData, setPostData] = useState<RedditPostData>({
    title: '',
    content: '',
    subreddit: '',
    flair: '',
    postType: 'text',
    tags: [],
    status: 'draft'
  });

  // Mock real-time post stats (in real app, this would come from API)
  const [postStats, setPostStats] = useState<PostStats>({
    upvotes: 1247,
    downvotes: 89,
    comments: 156,
    awards: 3,
    shares: 42,
    votes: 1158, // upvotes - downvotes
    upvotePercentage: 93,
    trending: true,
    postedTime: '4 hours ago'
  });

  const [currentTag, setCurrentTag] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);

  // Simulate real-time stats updates
  useEffect(() => {
    if (postData.status === 'published') {
      const interval = setInterval(() => {
        setPostStats(prev => {
          const randomUpvoteChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const randomCommentChange = Math.floor(Math.random() * 3); // 0 to +2
          const newUpvotes = Math.max(0, prev.upvotes + randomUpvoteChange);
          const newComments = prev.comments + randomCommentChange;
          const newVotes = newUpvotes - prev.downvotes;
          
          return {
            ...prev,
            upvotes: newUpvotes,
            comments: newComments,
            votes: newVotes,
            upvotePercentage: Math.round((newUpvotes / (newUpvotes + prev.downvotes)) * 100),
            trending: newVotes > 1000 && prev.upvotePercentage > 90
          };
        });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }
  }, [postData.status]);

  // Sample suggestions based on current content
  const generateSuggestions = (content: string) => {
    const baseSuggestions = [
      "Consider adding a TL;DR section",
      "Include relevant statistics or data",
      "Add a call-to-action for engagement",
      "Use formatting to improve readability",
      "Consider crossposting to related subreddits"
    ];
    
    if (content.length > 0) {
      setSuggestions(baseSuggestions.slice(0, 3));
    } else {
      setSuggestions([]);
    }
  };

  const updateField = (field: keyof RedditPostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'content') {
      generateSuggestions(value);
    }
  };

  const addTag = () => {
    if (currentTag && !postData.tags.includes(currentTag)) {
      updateField('tags', [...postData.tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', postData.tags.filter(tag => tag !== tagToRemove));
  };

  const parseRedditContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-bold mb-2 text-[#cccccc]">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold mb-2 text-[#cccccc]">{line.slice(3)}</h2>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-bold mb-1 text-[#cccccc]">{line.slice(2, -2)}</p>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-1 text-[#cccccc]">{line}</p>;
    });
  };

  const generateMarkdownContent = () => {
    let content = `# ${postData.title}\n\n`;
    content += postData.content;
    if (postData.tags.length > 0) {
      content += `\n\n**Tags:** ${postData.tags.join(', ')}`;
    }
    return content;
  };

  if (!isVisible) return null;

  return (
    <div className="reddit-editor-container h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
      <div className="flex-1 flex justify-start pt-6 pb-8 pl-6">
        <ScrollArea className="h-full w-full">
          <div className="pr-6 pb-6">
            <Card className="bg-[#1e1e1e] border-[#454545] shadow-xl rounded-sm">
              <CardHeader className="pb-4 border-b border-[#454545] bg-[#1e1e1e] rounded-t-sm">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-[#cccccc]">
                    <FileText className="w-5 h-5" />
                    Reddit Post Editor
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-[#858585] hover:text-[#cccccc] hover:bg-[#2d2d30]"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 bg-[#1e1e1e] rounded-b-sm">
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[#2d2d30] border border-[#454545] rounded-sm">
                    <TabsTrigger 
                      value="edit" 
                      className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white text-[#cccccc] bg-[#2d2d30] border-[#454545] rounded-sm"
                    >
                      Edit
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preview"
                      className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white text-[#cccccc] bg-[#2d2d30] border-[#454545] rounded-sm"
                    >
                      Preview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="settings"
                      className="data-[state=active]:bg-[#007acc] data-[state=active]:text-white text-[#cccccc] bg-[#2d2d30] border-[#454545] rounded-sm"
                    >
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-6 mt-6">
                    {/* Post Type Selection */}
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        variant={postData.postType === 'text' ? 'default' : 'outline'}
                        onClick={() => updateField('postType', 'text')}
                        className={`flex items-center gap-2 ${
                          postData.postType === 'text' 
                            ? 'bg-[#007acc] hover:bg-[#005a9e] text-white' 
                            : 'bg-[#3d3d3d] hover:bg-[#4d4d4d] border-[#454545] text-[#cccccc]'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        Text Post
                      </Button>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center gap-2 opacity-50 bg-[#2d2d30] border-[#454545] text-[#888888]"
                      >
                        Link Post (Coming Soon)
                      </Button>
                      <Button
                        variant="outline"
                        disabled
                        className="flex items-center gap-2 opacity-50 bg-[#2d2d30] border-[#454545] text-[#888888]"
                      >
                        Image Post (Coming Soon)
                      </Button>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#cccccc]">Subreddit</label>
                        <Input
                          placeholder="r/reactjs"
                          value={postData.subreddit}
                          onChange={(e) => updateField('subreddit', e.target.value)}
                          className="!bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] placeholder:!text-[#858585] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#cccccc]">Flair</label>
                        <Select value={postData.flair} onValueChange={(value) => updateField('flair', value)}>
                          <SelectTrigger className="!bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc] data-[placeholder]:!text-[#858585]">
                            <SelectValue placeholder="Select flair" />
                          </SelectTrigger>
                          <SelectContent className="!bg-[#252526] !border-[#454545] rounded-sm">
                            <SelectItem value="discussion" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Discussion</SelectItem>
                            <SelectItem value="question" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Question</SelectItem>
                            <SelectItem value="resource" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Resource</SelectItem>
                            <SelectItem value="news" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">News</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#cccccc]">Title</label>
                      <Input
                        ref={titleRef}
                        placeholder="Write a compelling title..."
                        value={postData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="text-lg !bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] placeholder:!text-[#858585] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]"
                      />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#cccccc]">Content</label>
                      <Textarea
                        placeholder="Write your post content here... You can use Reddit markdown formatting."
                        value={postData.content}
                        onChange={(e) => updateField('content', e.target.value)}
                        className="min-h-64 font-mono text-sm !bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] placeholder:!text-[#858585] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]"
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-[#cccccc]">Tags</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          className="flex-1 !bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] placeholder:!text-[#858585] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]"
                        />
                        <Button 
                          onClick={addTag} 
                          size="sm"
                          className="bg-[#007acc] hover:bg-[#005a9e] text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {postData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {postData.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="flex items-center gap-1 bg-[#2d2d30] text-[#cccccc] border-[#454545] hover:bg-[#3d3d3d]"
                            >
                              {tag}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-[#ff6b6b]"
                                onClick={() => removeTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Suggestions */}
                    {suggestions.length > 0 && (
                      <Card className="bg-[#2d2d30] border-[#454545] rounded-sm">
                        <CardHeader className="pb-3 bg-[#2d2d30] rounded-t-sm">
                          <CardTitle className="text-sm flex items-center gap-2 text-[#4fc3f7]">
                            <Lightbulb className="w-4 h-4" />
                            AI Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 bg-[#2d2d30] rounded-b-sm">
                          <ul className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm text-[#cccccc] flex items-start gap-2">
                                <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#4fc3f7]" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="preview" className="mt-6">
                    {/* Reddit-style Post Preview */}
                    <div className="bg-[#1a1a1b] border border-[#343536] rounded-md overflow-hidden shadow-lg">
                      {/* Post Header */}
                      <div className="flex items-start gap-3 p-3 bg-[#1a1a1b]">
                        {/* Vote Sidebar */}
                        <div className="flex flex-col items-center gap-1 min-w-[40px]">
                          <button 
                            className="p-1 rounded hover:bg-[#272729] transition-colors"
                            title="Upvote"
                            aria-label="Upvote post"
                          >
                            <ArrowUp className={`w-5 h-5 ${postStats.votes > 0 ? 'text-[#ff4500]' : 'text-[#818384]'}`} />
                          </button>
                          <span className={`text-xs font-bold ${
                            postStats.votes > 0 ? 'text-[#ff4500]' : 
                            postStats.votes < 0 ? 'text-[#7193ff]' : 'text-[#d7dadc]'
                          }`}>
                            {postStats.votes > 999 ? `${(postStats.votes/1000).toFixed(1)}k` : postStats.votes}
                          </span>
                          <button 
                            className="p-1 rounded hover:bg-[#272729] transition-colors"
                            title="Downvote"
                            aria-label="Downvote post"
                          >
                            <ArrowDown className={`w-5 h-5 ${postStats.votes < 0 ? 'text-[#7193ff]' : 'text-[#818384]'}`} />
                          </button>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 min-w-0">
                          {/* Post Meta Info */}
                          <div className="flex items-center gap-2 text-xs text-[#818384] mb-2">
                            <span className="font-bold text-[#d7dadc]">r/{postData.subreddit || 'subreddit'}</span>
                            <span>•</span>
                            <span>Posted by u/username {postStats.postedTime}</span>
                            {postStats.trending && (
                              <div className="flex items-center gap-1 bg-[#ff4500] text-white px-2 py-0.5 rounded-full">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs font-medium">Trending</span>
                              </div>
                            )}
                            {postData.flair && (
                              <Badge variant="outline" className="text-xs bg-[#373738] border-[#474748] text-[#d7dadc] px-2 py-0.5">
                                {postData.flair}
                              </Badge>
                            )}
                          </div>

                          {/* Post Title */}
                          <h3 className="text-lg font-medium text-[#d7dadc] mb-3 leading-tight">
                            {postData.title || 'Your Post Title Will Appear Here'}
                          </h3>

                          {/* Post Body */}
                          <div className="text-[#d7dadc] text-sm leading-relaxed mb-4">
                            {postData.content ? (
                              <div className="prose prose-invert max-w-none">
                                {parseRedditContent(postData.content)}
                              </div>
                            ) : (
                              <p className="text-[#818384] italic">Your post content will appear here...</p>
                            )}
                          </div>

                          {/* Tags */}
                          {postData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {postData.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline" 
                                  className="text-xs bg-[#373738] border-[#474748] text-[#7c7c83] hover:text-[#d7dadc] transition-colors"
                                >
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Post Actions Bar */}
                          <div className="flex items-center gap-6 text-xs text-[#818384] font-bold">
                            <button className="flex items-center gap-2 hover:bg-[#272729] px-2 py-1 rounded transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{postStats.comments} Comments</span>
                            </button>
                            <button className="flex items-center gap-2 hover:bg-[#272729] px-2 py-1 rounded transition-colors">
                              <Share className="w-4 h-4" />
                              <span>Share</span>
                            </button>
                            {postStats.awards > 0 && (
                              <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#ffd700]" />
                                <span className="text-[#ffd700]">{postStats.awards} Awards</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Real-time Stats Panel */}
                      <div className="bg-[#272729] border-t border-[#343536] p-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-4">
                            <div className="text-[#818384]">
                              <span className="text-[#d7dadc] font-medium">{postStats.upvotePercentage}%</span> Upvoted
                            </div>
                            <div className="text-[#818384]">
                              <span className="text-[#d7dadc] font-medium">{postStats.upvotes}</span> Upvotes
                            </div>
                            <div className="text-[#818384]">
                              <span className="text-[#d7dadc] font-medium">{postStats.downvotes}</span> Downvotes
                            </div>
                            {postStats.shares > 0 && (
                              <div className="text-[#818384]">
                                <span className="text-[#d7dadc] font-medium">{postStats.shares}</span> Shares
                              </div>
                            )}
                          </div>
                          
                          {/* Live indicator */}
                          {postData.status === 'published' && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-[#818384] text-xs">Live Stats</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress bar for upvote ratio */}
                        <div className="mt-2">
                          <div className="w-full bg-[#373738] rounded-full h-1.5">
                            <div 
                              className={`bg-[#ff4500] h-1.5 rounded-full transition-all duration-500`}
                              style={{
                                width: `${Math.min(100, Math.max(0, postStats.upvotePercentage))}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#cccccc]">Status</label>
                        <Select value={postData.status} onValueChange={(value: RedditPostData['status']) => updateField('status', value)}>
                          <SelectTrigger className="!bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="!bg-[#252526] !border-[#454545] rounded-sm">
                            <SelectItem value="draft" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Draft</SelectItem>
                            <SelectItem value="scheduled" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Scheduled</SelectItem>
                            <SelectItem value="published" className="!text-[#cccccc] hover:!bg-[#2a2d2e] focus:!bg-[#2a2d2e] !bg-[#252526]">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {postData.status === 'scheduled' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2 text-[#cccccc]">
                            <Clock className="w-4 h-4" />
                            Scheduled Time
                          </label>
                          <Input
                            type="datetime-local"
                            value={postData.scheduledTime || ''}
                            onChange={(e) => updateField('scheduledTime', e.target.value)}
                            className="!bg-[#1e1e1e] !border-[#454545] !text-[#cccccc] focus:!border-[#007acc] focus:!ring-1 focus:!ring-[#007acc]"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-[#454545] mt-6">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border-[#454545] text-[#cccccc]"
                  >
                    Close
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="bg-[#3d3d3d] hover:bg-[#4d4d4d] border-[#454545] text-[#cccccc]"
                    >
                      Save as Draft
                    </Button>
                    <Button className="bg-[#007acc] hover:bg-[#005a9e] text-white">
                      {postData.status === 'scheduled' ? 'Schedule Post' : 'Publish Post'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
