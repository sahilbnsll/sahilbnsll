# 🚀 GitHub Profile README Setup Guide

This guide will help you set up your amazing GitHub profile README with all the dynamic components!

## 📋 Prerequisites

- GitHub account
- Git installed on your machine
- (Optional) WakaTime account for coding stats

## 🔧 Setup Instructions

### 1. Push to GitHub

```bash
cd /Users/sahil/Desktop/portfolio/readme/sahilbnsll
git add .
git commit -m "feat: add modern GitHub profile README with animations"
git push origin main
```

### 2. Enable GitHub Actions

1. Go to your repository: `https://github.com/sahilbnsll/sahilbnsll`
2. Click on **Settings** → **Actions** → **General**
3. Under "Workflow permissions", select **Read and write permissions**
4. Click **Save**

### 3. Set up Snake Animation

The snake animation will automatically generate after you push the code. It runs:

- Every 12 hours automatically
- On every push to main
- Manually via workflow dispatch

**To trigger manually:**

1. Go to **Actions** tab
2. Click on "Generate Snake Animation"
3. Click **Run workflow**

### 4. (Optional) Set up WakaTime Stats

WakaTime shows your weekly coding activity breakdown by language, editor, and project.

**Steps:**

1. Sign up at [wakatime.com](https://wakatime.com)
2. Install WakaTime plugin in VS Code/your IDE
3. Get your API key from [wakatime.com/settings/api-key](https://wakatime.com/settings/api-key)
4. Add it as a GitHub secret:
   - Go to your repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `WAKATIME_API_KEY`
   - Value: Your WakaTime API key
   - Click **Add secret**

## ✨ Features Included

### 🎨 Visual Components

- ✅ Animated waving header banner
- ✅ Typing SVG with rotating text
- ✅ Profile view counter
- ✅ Coding GIF animation
- ✅ Bottom wave decoration

### 📊 Dynamic Stats

- ✅ GitHub stats card (commits, PRs, stars)
- ✅ Contribution streak counter
- ✅ Top languages chart
- ✅ Activity contribution graph
- ✅ GitHub trophies
- ✅ Snake eating contributions animation
- ✅ WakaTime coding stats (optional)

### 💼 Professional Content

- ✅ Company logos (Buyogo, Capgemini, Qapita, Xebia)
- ✅ Modern skill icons (skillicons.dev)
- ✅ Achievements table with metrics
- ✅ Mermaid mindmap diagram
- ✅ YAML-formatted About Me section

### 🔗 Social Links

- ✅ Portfolio (sahilbansal.vercel.app)
- ✅ LinkedIn
- ✅ Email
- ✅ Twitter

## 🎯 All Components Status

| Component | Status | Notes |
|-----------|--------|-------|
| Animated Header | ✅ Working | capsule-render.vercel.app |
| Typing SVG | ✅ Working | readme-typing-svg.demolab.com |
| Profile Views | ✅ Working | komarev.com |
| GitHub Stats | ✅ Working | github-readme-stats.vercel.app |
| Streak Stats | ✅ Working | github-readme-streak-stats.herokuapp.com |
| Top Languages | ✅ Working | github-readme-stats.vercel.app |
| Activity Graph | ✅ Working | github-readme-activity-graph.vercel.app |
| Trophies | ✅ Working | github-profile-trophy.vercel.app |
| Skill Icons | ✅ Working | skillicons.dev |
| Snake Animation | ⏳ Pending | Requires GitHub Actions setup |
| WakaTime Stats | ⏳ Optional | Requires API key |
| Company Logos | ✅ Working | Local files in A/ folder |
| Mermaid Diagram | ✅ Working | Native GitHub support |

## 🐛 Troubleshooting

### Snake Animation Not Showing?

1. Check if GitHub Actions ran successfully in the **Actions** tab
2. Verify workflow permissions are set to "Read and write"
3. Wait a few minutes after the first run
4. Check if `output` branch was created

### WakaTime Stats Not Updating?

1. Verify `WAKATIME_API_KEY` secret is set correctly
2. Check if you have WakaTime plugin installed and tracking
3. Wait 24 hours for first stats to appear
4. Check Actions tab for any errors

### Company Logos Not Showing?

1. Make sure all PNG files are committed to the `A/` folder
2. Check if the repository is public
3. Wait a few minutes for GitHub CDN to cache images

## 🎨 Customization

### Change Color Scheme

Edit the color codes in README.md:

- `F75C7E` - Pink/Red accent color
- `0D1117` - Dark background
- `FF6B35` - Orange accent

### Update Skills

Modify the skill icons by changing the icons parameter:

```
https://skillicons.dev/icons?i=aws,terraform,docker,kubernetes
```

Available icons: [skillicons.dev](https://skillicons.dev)

### Add More Sections

You can add:

- Blog posts feed
- Latest YouTube videos
- Spotify now playing
- Random dev jokes
- Quote of the day

## 📈 Expected Impact on Hireability

✅ **Professional First Impression** - Modern, polished design  
✅ **Quantifiable Achievements** - $40k savings, 99.99% uptime  
✅ **Technical Depth** - Comprehensive tech stack display  
✅ **Active Developer** - Live contribution stats  
✅ **DevOps Expertise** - Clear focus on automation & cloud  
✅ **Attention to Detail** - Well-organized, visually appealing  

## 🚀 Next Steps

1. Push all changes to GitHub
2. Enable GitHub Actions
3. Wait for snake animation to generate
4. (Optional) Set up WakaTime
5. Share your profile on LinkedIn!

---

**Your GitHub Profile:** [github.com/sahilbnsll](https://github.com/sahilbnsll)

Made with ❤️ and lots of automation! 🤖
