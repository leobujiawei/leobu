import os
import random

template = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{TITLE} | KANSO 风格</title>
    <link rel="stylesheet" href="detail.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="topbar">
        <a href="index.html" class="back-link">← RETURN</a>
        <div class="topbar-title">{TITLE}</div>
    </nav>
    <div class="detail-container">
        <!-- 左侧纵向几何 Tab 导航 -->
        <nav class="geo-tabs">
{TABS}
        </nav>
        <!-- 右侧图文滚动区域 -->
        <main class="content-scroll">
            <div class="content-wrapper">
{CONTENT}
            </div>
        </main>
    </div>
    <!-- Scripts -->
    <script src="detail.js"></script>
</body>
</html>"""

svgs = [
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><circle cx="50" cy="50" r="48" stroke="white" stroke-width="1" fill="none" class="shape-fill" /></svg>',
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,2 98,98 2,98" stroke="white" stroke-width="1" fill="none" class="shape-fill" /></svg>',
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="2" y="2" width="96" height="96" stroke="white" stroke-width="1" fill="none" class="shape-fill" /></svg>',
    '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,2 98,50 50,98 2,50" stroke="white" stroke-width="1" fill="none" class="shape-fill" /></svg>'
]

data = [
    {
        "title": "搜索内容消费体验设计",
        "sections": [
            {"name": "游戏垂类生态建设", "keyword": "游戏", "desc": "下载、QB福利、全网福利、活动、直播、电竞、攻略"},
            {"name": "影视垂类生态建设", "keyword": "影视", "desc": "影视搜索结果、六合专题生态、演员vcr宣发"},
            {"name": "其他内容生态", "keyword": "其他", "desc": "字词成语诗文、全网热搜榜、低价会员、信息流、AI快看"}
        ]
    },
    {
        "title": "AI时代",
        "sections": [
            {"name": "AI coding 工作方式进化", "keyword": "AI工作", "desc": ""},
            {"name": "元宝春节创意模板", "keyword": "元宝模板", "desc": ""}
        ]
    },
    {
        "title": "游戏化运营",
        "sections": [
            {"name": "洛阳博物馆联合运营项目", "keyword": "洛阳", "desc": ""},
            {"name": "不摆烂指南系列", "keyword": "指南", "desc": ""}
        ]
    },
    {
        "title": "前瞻探索",
        "sections": [
            {"name": "搜索+AI前沿交互方式探索", "keyword": "交互探索", "desc": ""},
            {"name": "泛娱乐内容呈现方式探索", "keyword": "泛娱乐", "desc": ""},
            {"name": "百科+文旅内容呈现", "keyword": "百科文旅", "desc": ""}
        ]
    },
    {
        "title": "数字孪生、公共交通数据可视化呈现",
        "sections": [
            {"name": "完整作品集", "keyword": "数据可视", "desc": "包含数字孪生、公共交通数据的深度图表与大屏数据可视化的探索"}
        ]
    },
    {
        "title": "传统手艺人时代作品",
        "sections": [
            {"name": "各类手艺人作品精选", "keyword": "手艺人", "desc": "插画、3D、动效、游戏"}
        ]
    }
]

images = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610368153308-41ec63ce2f11?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616859590833-289b02a9b319?q=80&w=1965&auto=format&fit=crop"
]

for i, d in enumerate(data):
    file_idx = i + 1
    tabs_html = ""
    content_html = ""
    for j, sec in enumerate(d["sections"]):
        active = ' active' if j == 0 else ''
        svg = svgs[j % len(svgs)]
        tabs_html += f'''            <a href="#section-{j+1}" class="geo-tab{active}" data-target="section-{j+1}">
                {svg}
                <span class="tab-text">{sec["keyword"]}</span>
            </a>\n'''
        
        img_url = random.choice(images)
        img_url2 = random.choice(images)
        imgs_div = f"""<div class="demo-image" style="background-image: url('{img_url}');"></div>"""
        if file_idx == 1 or file_idx == 4 or file_idx == 6:
            imgs_div += f"""\n                        <div class="demo-image" style="background-image: url('{img_url2}');"></div>"""

        content_html += f"""                <section id="section-{j+1}" class="detail-section">
                    <div class="section-title">
                        <span class="section-num">{j+1}</span>
                        <h2>{sec['name']}</h2>
                    </div>
                    <div class="section-desc">
                        {sec['desc']}
                    </div>
                    <div class="image-gallery">
                        {imgs_div}
                    </div>
                </section>\n"""
                
    final_html = template.replace("{TITLE}", d["title"]).replace("{TABS}", tabs_html).replace("{CONTENT}", content_html)
    with open(f"/Users/文件/ai coding/test/detail_{file_idx}.html", "w", encoding="utf-8") as f:
        f.write(final_html)

print("Generated 6 detail pages.")
