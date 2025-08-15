'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Hash,
  Settings,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface RedditPostEditorProps {
  content: string
  onChange: (content: string) => void
  editable: boolean
  fileName: string
  onPublish?: () => void
  onSchedule?: (date: Date) => void
  onSaveDraft?: () => void
}

interface RedditFields {
  subreddit: string
  title: string
  postType: 'self' | 'link'
  linkUrl: string
  nsfw: boolean
  spoiler: boolean
  sendReplies: boolean
  flairText: string
  flairId: string
  body: string
  status: 'draft' | 'scheduled' | 'posted' | 'failed'
  scheduledDate: string | null
}

// Popular subreddits for suggestions
const popularSubreddits = [
  { name: 'r/AskReddit', description: 'Ask and answer thought-provoking questions' },
  { name: 'r/technology', description: 'Technology news and discussions' },
  { name: 'r/programming', description: 'Programming discussions and resources' },
  { name: 'r/webdev', description: 'Web development community' },
  { name: 'r/javascript', description: 'JavaScript discussions and help' },
  { name: 'r/reactjs', description: 'React.js community' },
  { name: 'r/startups', description: 'Startup discussions and advice' },
  { name: 'r/entrepreneur', description: 'Entrepreneurship community' },
]

// Parse Reddit fields from markdown content
const parseRedditContent = (content: string): RedditFields => {
  const lines = content.split('\n')
  const settings: RedditFields = {
    subreddit: 'test',
    postType: 'self',
    title: '',
    body: '',
    nsfw: false,
    spoiler: false,
    sendReplies: true,
    flairText: '',
    flairId: '',
    linkUrl: '',
    status: 'draft',
    scheduledDate: null
  }

  let inContent = false
  let inSettings = false
  let contentLines: string[] = []

  for (const line of lines) {
    if (line.includes('## Post Content')) {
      inContent = true
      inSettings = false
      continue
    }
    if (line.includes('## Settings')) {
      inContent = false
      inSettings = true
      continue
    }
    if (line.includes('## Media') || line.includes('## Analytics')) {
      inContent = false
      inSettings = false
      continue
    }

    if (inContent) {
      contentLines.push(line)
    }

    if (inSettings) {
      if (line.includes('Subreddit:')) {
        settings.subreddit = line.split('r/')[1]?.trim() || 'test'
      }
      if (line.includes('Post Type:')) {
        settings.postType = line.includes('Link') ? 'link' : 'self'
      }
      if (line.includes('Link URL:')) {
        settings.linkUrl = line.split('Link URL:')[1]?.trim() || ''
      }
      if (line.includes('NSFW:')) {
        settings.nsfw = line.includes('Yes')
      }
      if (line.includes('Spoiler:')) {
        settings.spoiler = line.includes('Yes')
      }
      if (line.includes('Send Replies:')) {
        settings.sendReplies = line.includes('Yes')
      }
      if (line.includes('Flair:')) {
        settings.flairText = line.split('Flair:')[1]?.trim() || ''
      }
    }

    // Check for title in the header
    if (line.startsWith('#') && !line.includes('##')) {
      const titleMatch = line.match(/# (.+) - Reddit Post/)
      if (titleMatch) {
        settings.title = titleMatch[1]
      }
    }

    // Check status
    if (line.includes('Status:')) {
      if (line.includes('Scheduled')) settings.status = 'scheduled'
      if (line.includes('Posted')) settings.status = 'posted'
      if (line.includes('Failed')) settings.status = 'failed'
    }
  }

  settings.body = contentLines.join('\n').trim()
  return settings
}

// AI Action Buttons
const SuggestSubredditsButton: React.FC<{ onAction: () => void; loading?: boolean; disabled?: boolean }> = ({ 
  onAction, 
  loading, 
  disabled 
}) => (
  <Button
    size="sm"
    variant="outline"
    onClick={onAction}
    disabled={disabled || loading}
    className="text-xs gap-1.5 hover:bg-orange-50 hover:border-orange-300 transition-colors"
  >
    <Hash className="w-3 h-3" />
    {loading ? 'Finding...' : 'Suggest Subreddits'}
  </Button>
)

const ImproveEngagementButton: React.FC<{ onAction: () => void; loading?: boolean; disabled?: boolean }> = ({ 
  onAction, 
  loading, 
  disabled 
}) => (
  <Button
    size="sm"
    variant="outline"
    onClick={onAction}
    disabled={disabled || loading}
    className="text-xs gap-1.5 hover:bg-orange-50 hover:border-orange-300 transition-colors"
  >
    <TrendingUp className="w-3 h-3" />
    {loading ? 'Optimizing...' : 'Improve Engagement'}
  </Button>
)

const GenerateTitleButton: React.FC<{ onAction: () => void; loading?: boolean; disabled?: boolean }> = ({ 
  onAction, 
  loading, 
  disabled 
}) => (
  <Button
    size="sm"
    variant="outline"
    onClick={onAction}
    disabled={disabled || loading}
    className="text-xs gap-1.5 hover:bg-orange-50 hover:border-orange-300 transition-colors"
  >
    <Sparkles className="w-3 h-3" />
    {loading ? 'Generating...' : 'Generate Titles'}
  </Button>
)

export const RedditPostEditor: React.FC<RedditPostEditorProps> = ({
  content,
  onChange,
  editable,
  fileName,
  onPublish,
  onSchedule,
  onSaveDraft
}) => {
  const parsedContent = useMemo(() => parseRedditContent(content), [content])
  
  const [fields, setFields] = useState<RedditFields>(parsedContent)
  const [activeTab, setActiveTab] = useState('compose')
  const [isSubredditDropdownOpen, setIsSubredditDropdownOpen] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiLoading, setAiLoading] = useState({ subreddits: false, engagement: false, titles: false })
  const isInternalUpdate = useRef(false)

  // Update fields when content changes externally (but not when we're updating it ourselves)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      const newParsedContent = parseRedditContent(content)
      setFields(newParsedContent)
    }
  }, [content])

  // Show AI suggestions when content is substantial
  useEffect(() => {
    setShowAISuggestions(fields.body.length > 10)
  }, [fields.body])

  // Generate markdown content from fields
  const generateMarkdownContent = useCallback(() => {
    return `# ${fields.title || fileName} - Reddit Post
Platform: reddit
Created: ${new Date().toISOString()}
Status: ${fields.status}

## Post Content
${fields.body}

## Settings
- Subreddit: r/${fields.subreddit}
- Post Type: ${fields.postType === 'link' ? 'Link' : 'Text'}
${fields.postType === 'link' ? `- Link URL: ${fields.linkUrl}` : ''}
- NSFW: ${fields.nsfw ? 'Yes' : 'No'}
- Spoiler: ${fields.spoiler ? 'Yes' : 'No'}
- Send Replies: ${fields.sendReplies ? 'Yes' : 'No'}
- Flair: ${fields.flairText}
- Schedule: ${fields.scheduledDate || 'Now'}

## Media
- Images: []
- Videos: []

## Analytics
- Impressions: 0
- Engagements: 0
- Likes: 0
- Shares: 0`
  }, [fields, fileName])

  // Update content when fields change (with loop prevention)
  useEffect(() => {
    isInternalUpdate.current = true
    const newContent = generateMarkdownContent()
    onChange(newContent)
    // Reset flag after a brief delay to allow external updates
    setTimeout(() => {
      isInternalUpdate.current = false
    }, 100)
  }, [fields, generateMarkdownContent, onChange])

  const updateField = useCallback(<K extends keyof RedditFields>(
    field: K, 
    value: RedditFields[K]
  ) => {
    setFields(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleOpenInReddit = useCallback(() => {
    const redditUrl = fields.postType === 'link' 
      ? `https://www.reddit.com/r/${fields.subreddit}/submit?url=${encodeURIComponent(fields.linkUrl)}&title=${encodeURIComponent(fields.title)}`
      : `https://www.reddit.com/r/${fields.subreddit}/submit?title=${encodeURIComponent(fields.title)}&text=${encodeURIComponent(fields.body)}`
    window.open(redditUrl, '_blank')
  }, [fields])

  const handleAIAction = useCallback((action: 'subreddits' | 'engagement' | 'titles') => {
    setAiLoading(prev => ({ ...prev, [action]: true }))
    
    // Simulate AI processing
    setTimeout(() => {
      setAiLoading(prev => ({ ...prev, [action]: false }))
      
      switch (action) {
        case 'subreddits':
          // In real implementation, this would call your AI service
          console.log('AI suggesting subreddits for:', fields.body)
          break
        case 'engagement':
          // In real implementation, this would optimize the content
          console.log('AI improving engagement for:', fields.body)
          break
        case 'titles':
          // In real implementation, this would generate title suggestions
          console.log('AI generating titles for:', fields.body)
          break
      }
    }, 2000)
  }, [fields.body])

  const getStatusBadge = () => {
    switch (fields.status) {
      case 'posted':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><Check className="w-3 h-3 mr-1" />Posted</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><X className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline" className="border-muted-foreground/20">Draft</Badge>
    }
  }

  return (
    <div className="relative w-full ml-2">
      {/* Header Tab */}
      <div className="bg-muted absolute -top-[28px] left-0 flex items-center justify-center py-1 px-4 border-b-none rounded-t-lg border-t-black/20 border-t-[0.5px] border-x-[0.5px] border-x-black/20">
        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-1.5">
          <span className="text-white font-bold text-xs">r/</span>
        </div>
        <h4 className="text-sm tracking-tight">Reddit Post Agent</h4>
      </div>

      <div className="w-full bg-muted rounded-xl overflow-hidden shadow-[0px_1px_1px_0px_rgba(0,_0,_0,_0.05),_0px_1px_1px_0px_rgba(255,_252,_240,_0.5)_inset,_0px_0px_0px_1px_hsla(0,_0%,_100%,_0.1)_inset,_0px_0px_1px_0px_rgba(28,_27,_26,_0.5)]">
        {/* Status Banner */}
        {fields.status !== 'draft' && (
          <div className="p-4 pb-0">
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  <span className="text-sm text-muted-foreground">
                    {fields.status === 'posted' && 'This post has been published to Reddit'}
                    {fields.status === 'scheduled' && 'This post is scheduled for publishing'}
                    {fields.status === 'failed' && 'Failed to publish this post'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-start sm:space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full sm:flex items-center justify-center hidden">
                  <span className="text-white font-bold text-lg">r/</span>
                </div>
                <div className="flex-grow">
                  <h2 className="font-semibold text-lg">Reddit</h2>
                  <DropdownMenu
                    open={isSubredditDropdownOpen}
                    onOpenChange={setIsSubredditDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="h-3 flex items-center text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        disabled={!editable}
                      >
                        Post to r/{fields.subreddit || 'ChooseACommunity'}
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 max-h-60">
                      <ScrollArea className="h-full">
                        <div className="max-h-60">
                          {popularSubreddits.map((sub, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => {
                                updateField('subreddit', sub.name.replace('r/', ''))
                                setIsSubredditDropdownOpen(false)
                              }}
                              className="flex flex-col items-start p-3 cursor-pointer"
                            >
                              <div className="font-medium text-sm">{sub.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {sub.description}
                              </div>
                            </DropdownMenuItem>
                          ))}
                          <div className="p-2 border-t">
                            <Input
                              placeholder="Enter custom subreddit"
                              value={fields.subreddit}
                              onChange={(e) => updateField('subreddit', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </ScrollArea>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {fields.body.length} characters
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="compose" className="text-xs">Compose</TabsTrigger>
                <TabsTrigger value="schedule" className="text-xs">Schedule</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-4">
                {/* Title Input */}
                <div>
                  <Label className="text-xs text-muted-foreground/50 mb-2 block">Title</Label>
                  <Input
                    placeholder="Type a title for your post"
                    value={fields.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    disabled={!editable}
                    className="border-border/10"
                  />
                </div>

                {/* Post Type Selector */}
                <div className="flex gap-2">
                  <Button
                    variant={fields.postType === 'self' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateField('postType', 'self')}
                    disabled={!editable}
                    className="text-xs"
                  >
                    Text Post
                  </Button>
                  <Button
                    variant={fields.postType === 'link' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateField('postType', 'link')}
                    disabled={!editable}
                    className="text-xs"
                  >
                    Link Post
                  </Button>
                </div>

                {/* Link URL (if link post) */}
                {fields.postType === 'link' && (
                  <div className="transition-all duration-200">
                    <Label className="text-xs text-muted-foreground/50 mb-2 block">URL</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={fields.linkUrl}
                      onChange={(e) => updateField('linkUrl', e.target.value)}
                      disabled={!editable}
                      className="border-border/10"
                    />
                  </div>
                )}

                {/* Body Content */}
                {fields.postType === 'self' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-muted-foreground/50">Body</Label>
                      <span className="text-xs text-muted-foreground/50">
                        {fields.body.length} characters
                      </span>
                    </div>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={fields.body}
                      onChange={(e) => updateField('body', e.target.value)}
                      disabled={!editable}
                      className="min-h-[100px] max-h-[200px] resize-none bg-muted/30 shadow-inner border-border/10 focus:outline-none rounded-lg"
                    />
                  </div>
                )}

                {/* Post Options */}
                <div className="space-y-3 pt-4 border-t border-border/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Mark as NSFW</Label>
                    <Switch
                      checked={fields.nsfw}
                      onCheckedChange={(checked) => updateField('nsfw', checked)}
                      disabled={!editable}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Mark as Spoiler</Label>
                    <Switch
                      checked={fields.spoiler}
                      onCheckedChange={(checked) => updateField('spoiler', checked)}
                      disabled={!editable}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Send Reply Notifications</Label>
                    <Switch
                      checked={fields.sendReplies}
                      onCheckedChange={(checked) => updateField('sendReplies', checked)}
                      disabled={!editable}
                    />
                  </div>
                </div>

                {/* Flair */}
                <div>
                  <Label className="text-xs text-muted-foreground/50 mb-2 block">Flair (optional)</Label>
                  <Input
                    placeholder="Add flair text"
                    value={fields.flairText}
                    onChange={(e) => updateField('flairText', e.target.value)}
                    disabled={!editable}
                    className="border-border/10"
                  />
                </div>

                {/* AI Suggestions */}
                {editable && showAISuggestions && (
                  <div className="pt-4 transition-all duration-300 opacity-100">
                    <p className="text-xs text-muted-foreground/50 mb-2 flex items-center">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
                      AI Actions
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <SuggestSubredditsButton
                        onAction={() => handleAIAction('subreddits')}
                        loading={aiLoading.subreddits}
                      />
                      <ImproveEngagementButton
                        onAction={() => handleAIAction('engagement')}
                        loading={aiLoading.engagement}
                      />
                      <GenerateTitleButton
                        onAction={() => handleAIAction('titles')}
                        loading={aiLoading.titles}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <h3 className="font-semibold text-sm">Schedule Post</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Schedule functionality coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="border-border/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <h3 className="font-semibold text-sm">Post Settings</h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Additional settings coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-4 ml-auto w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenInReddit}
            className="rounded-full bg-[#FF4500]/5 text-[#FF4500] hover:bg-[#FF4500]/10 w-full sm:w-auto border-[#FF4500]/30 border gap-2"
          >
            <ExternalLink className="w-3 h-3 stroke-orange-500" />
            Open post in Reddit
          </Button>
          
          {editable && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onSaveDraft}
                size="sm"
                className="text-xs"
              >
                Save Draft
              </Button>
              <Button
                onClick={onPublish}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-xs"
              >
                Publish Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
