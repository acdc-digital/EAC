import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Clock, FileText, Lightbulb, Plus, Sparkles, Users, X } from 'lucide-react';
import { useRef, useState } from 'react';

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

  const [currentTag, setCurrentTag] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);

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
      <div className="flex-1 flex justify-center pt-6 pb-8">
        <ScrollArea className="h-full w-full max-w-4xl">
          <div className="px-6 pb-6">
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
                    <Card className="bg-[#252526] border-[#454545] rounded-sm">
                      <CardHeader className="border-b border-[#454545] bg-[#252526] rounded-t-sm">
                        <div className="flex items-center gap-2 text-sm text-[#858585]">
                          <Users className="w-4 h-4" />
                          {postData.subreddit || 'r/subreddit'}
                          {postData.flair && (
                            <Badge variant="outline" className="text-xs bg-[#2d2d30] border-[#454545] text-[#cccccc]">
                              {postData.flair}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-[#cccccc]">
                          {postData.title || 'Your Post Title'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 bg-[#252526] rounded-b-sm">
                        <ScrollArea className="max-h-96">
                          <div className="prose max-w-none">
                            {postData.content ? parseRedditContent(postData.content) : (
                              <p className="text-[#858585] italic">Your post content will appear here...</p>
                            )}
                          </div>
                          {postData.tags.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-[#454545]">
                              <div className="flex flex-wrap gap-2">
                                {postData.tags.map(tag => (
                                  <Badge 
                                    key={tag} 
                                    variant="outline" 
                                    className="text-xs bg-[#2d2d30] border-[#454545] text-[#cccccc]"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
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
