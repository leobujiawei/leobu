

// --- 0. Custom Cursor Logic ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let posX = 0, posY = 0;
let mouseX = 0, mouseY = 0;
let pageMouseX = 0, pageMouseY = 0;

if (cursor && follower) {
    // Safe setter initialization
    const xCursorSetter = typeof gsap !== 'undefined' ? gsap.quickSetter(cursor, "x", "px") : null;
    const yCursorSetter = typeof gsap !== 'undefined' ? gsap.quickSetter(cursor, "y", "px") : null;
    const xFollowerSetter = typeof gsap !== 'undefined' ? gsap.quickSetter(follower, "x", "px") : null;
    const yFollowerSetter = typeof gsap !== 'undefined' ? gsap.quickSetter(follower, "y", "px") : null;

    if (typeof gsap !== 'undefined') {
        window.addEventListener("mousemove", e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            pageMouseX = e.pageX;
            pageMouseY = e.pageY;
        });

        gsap.ticker.add(() => {
            // Smooth follower movement (increased responsiveness)
            const dt = 1.0 - Math.pow(1.0 - 0.3, gsap.ticker.deltaRatio());
            posX += (mouseX - posX) * dt;
            posY += (mouseY - posY) * dt;

            // Position cursor exactly at mouse
            if (xCursorSetter) xCursorSetter(mouseX - 4);
            if (xFollowerSetter) xFollowerSetter(posX - 20);
            if (yCursorSetter) yCursorSetter(mouseY - 4);
            if (yFollowerSetter) yFollowerSetter(posY - 20);
        });
    }


    // Hover effects
    const interactiveElements = "a, button, .work-item, .geo-tab, .back-link, .nav-btn";

    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(interactiveElements)) {
            document.body.classList.add("cursor-hover");
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(interactiveElements)) {
            document.body.classList.remove("cursor-hover");
        }
    });

    // Hide cursor when leaving window
    document.addEventListener("mouseleave", () => {
        gsap.to([cursor, follower], { opacity: 0, duration: 0.3 });
    });
    document.addEventListener("mouseenter", () => {
        gsap.to([cursor, follower], { opacity: 1, duration: 0.3 });
    });
}

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

let locoScroll;
if (typeof LocomotiveScroll !== 'undefined') {
    locoScroll = new LocomotiveScroll({
        el: document.querySelector('#main-content'),
        smooth: true,
        lerp: 0.12, // Increased for a more direct, responsive feel
        multiplier: 1.1, // Added a slight boost to reduce scrolling effort
        tablet: { smooth: false },
        smartphone: { smooth: false }
    });
    
    // Initial stop to prevent interaction while loading/calculating
    locoScroll.stop();
}

// Update ScrollTrigger on Locomotive Scroll event
if (locoScroll && typeof ScrollTrigger !== 'undefined') {
    locoScroll.on("scroll", (args) => {
        ScrollTrigger.update();
        const topBar = document.querySelector('.topbar');
        if (topBar) {
            if (args.scroll.y > 50) {
                topBar.classList.add('is-scrolled');
            } else {
                topBar.classList.remove('is-scrolled');
            }
        }
    });

    // Tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element
    ScrollTrigger.scrollerProxy("#main-content", {
        scrollTop(value) {
            return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: document.querySelector("#main-content").style.transform ? "transform" : "fixed"
    });
}

// Refresh ScrollTrigger when window updates
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Helper to refresh everything when layout changes
const refreshScroll = debounce(() => {
    if (typeof locoScroll !== 'undefined') {
        locoScroll.update();
        ScrollTrigger.refresh();
    }
}, 250); // Increased wait time to 250ms to reduce overhead during page settling

// 1. Refresh on images load
window.addEventListener('load', () => {
    refreshScroll();
    // Second pass to handle late layout shifts
    setTimeout(refreshScroll, 500);
});

// 2. Refresh on window resize
window.addEventListener('resize', refreshScroll);

// 3. ResizeObserver to catch any dynamic height changes
let lastHeight = 0;
const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
        const height = entry.contentRect.height;
        if (Math.abs(height - lastHeight) > 10) { // Only refresh if height change is $> 10px$
            lastHeight = height;
            refreshScroll();
        }
    }
});
if (document.querySelector('#main-content')) {
    resizeObserver.observe(document.querySelector('#main-content'));
}

// Initial refresh
ScrollTrigger.refresh();

// --- 1.2 Hero Curtain Animation ---
if (document.querySelector('.hero-stage')) {
    gsap.to('.hero-curtain-left', {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            scroller: "#main-content",
            start: "top top",
            end: "+=150%", // Continue animating for 1.5x the height
            scrub: true
        }
    });

    gsap.to('.hero-curtain-right', {
        xPercent: 50,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            scroller: "#main-content",
            start: "top top",
            end: "+=150%",
            scrub: true
        }
    });
}



// --- 2. Text Scramble Effect ---
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.chars[Math.floor(Math.random() * this.chars.length)];
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
}

// Initialize Scramble Effect for Elements
function initScramble() {
    const titles = document.querySelectorAll('.scramble-text:not(.scramble-init)');

    titles.forEach((el) => {
        el.classList.add('scramble-init');
        const fx = new TextScramble(el);
        const finalText = el.innerText; // Store the original text

        // Clear initially with spaces of the same visible presence to hold width if possible,
        // or just rely on the fact that it has its final text initially (opacity 0)
        // el.innerHTML = '&nbsp;'; // REMOVED to prevent layout shift

        ScrollTrigger.create({
            trigger: el,
            scroller: "#main-content",
            start: "top 95%", // Slightly lower trigger point
            onEnter: () => {
                el.style.opacity = 1;
                fx.setText(finalText);
            },
            // If it's already past the point when refreshing, show it
            once: true
        });
    });
}

// --- 3. Loader Animation ---
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.querySelector('.loader');
    const body = document.body;
    const bar = document.querySelector('.loader-bar');

    // Immediate progress start to show it's working
    let progressTL = gsap.timeline();
    progressTL.to(bar, {
        width: '35%',
        duration: 0.8,
        ease: 'power3.out'
    });

    // Function to initialize page once loaded
    const startPage = () => {
        if (body.classList.contains('loaded')) return;
        
        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                loader.style.display = 'none';
                body.classList.add('loaded');
                
                // Initialize everything after a brief paint cycle to ensure smoothness
                requestAnimationFrame(() => {
                    if (typeof locoScroll !== 'undefined' && locoScroll) {
                        locoScroll.update();
                        locoScroll.start();
                    }
                    
                    if (typeof ScrollTrigger !== 'undefined') {
                        initScramble();
                        ScrollTrigger.refresh();
                    } else {
                        // Fallback: Just show text if animation library is missing
                        document.querySelectorAll('.scramble-text').forEach(el => el.style.opacity = 1);
                    }
                });
            }
        });
    };

    // Use Font Loading API to wait for fonts being ready
    document.fonts.ready.then(() => {
        // Progress animation to 100%
        progressTL.to(bar, {
            width: '100%',
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Subtle pause before exit
                setTimeout(startPage, 200);
            }
        });
    }).catch(err => {
        console.warn("Font loading failed, falling back:", err);
        startPage();
    });

    // Fallback: If fonts take too long, still show the site
    setTimeout(startPage, 5000);
});




// --- 7. Detail View Logic ---
let currentDetailObserver = null;
let currentActiveDetailId = null;

window.openDetail = function (e, id) {
    if (e) e.preventDefault();
    currentActiveDetailId = id;
    document.getElementById('home-view').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('home-view').style.display = 'none';

        document.querySelectorAll('.detail-wrapper').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });

        const detailEl = document.getElementById('detail-' + id);
        if (detailEl) {
            detailEl.style.display = 'block';
            document.body.classList.add('detail-active');
            locoScroll.stop();

            // Allow display block to render, then transition opacity
            setTimeout(() => {
                detailEl.classList.add('active');
            }, 10);

            initDetailLogic(detailEl);
        }
    }, 300);
};

window.closeDetail = function (e) {
    if (e) e.preventDefault();
    if (currentDetailObserver) {
        currentDetailObserver.disconnect();
    }

    document.querySelectorAll('.detail-wrapper').forEach(el => {
        el.classList.remove('active');
        // Pause all videos when closing
        el.querySelectorAll('video').forEach(video => {
            video.pause();
            const parent = video.closest('.demo-image');
            if (parent) parent.classList.remove('video-playing');
        });
    });

    setTimeout(() => {
        document.querySelectorAll('.detail-wrapper').forEach(el => {
            el.style.display = 'none';
        });
        document.body.classList.remove('detail-active');

        document.getElementById('home-view').style.display = 'block';
        setTimeout(() => {
            document.getElementById('home-view').style.opacity = '1';
            locoScroll.start();
            locoScroll.update();
        }, 50);
    }, 300);
};

window.navigateDetail = function (e, direction) {
    if (e) e.preventDefault();
    if (!currentActiveDetailId) return;

    let nextId = currentActiveDetailId + direction;
    if (nextId > 6) nextId = 1;
    if (nextId < 1) nextId = 6;

    // Hide current without revealing home
    const currentEl = document.getElementById('detail-' + currentActiveDetailId);
    if (currentEl) {
        currentEl.classList.remove('active');
        // Wait for CSS transition then hide
        setTimeout(() => {
            currentEl.style.display = 'none';
        }, 300);
    }

    currentActiveDetailId = nextId;

    // Show next one immediately on top or behind
    const nextEl = document.getElementById('detail-' + nextId);
    if (nextEl) {
        nextEl.style.display = 'block';
        // Force reflow
        nextEl.offsetWidth;
        nextEl.classList.add('active');
        initDetailLogic(nextEl);
    }
};

function initDetailLogic(detailEl) {
    const scrollContainer = detailEl.querySelector('.content-scroll');
    const sections = detailEl.querySelectorAll('.detail-section');
    const tabs = detailEl.querySelectorAll('.geo-tab');

    // reset scroll
    scrollContainer.scrollTop = 0;

    const newTabs = [];
    tabs.forEach(tab => {
        const clone = tab.cloneNode(true);
        tab.parentNode.replaceChild(clone, tab);
        newTabs.push(clone);
    });

    newTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = tab.getAttribute('data-target');
            // Select within this specific detail container
            const targetEl = detailEl.querySelector('#' + targetId);

            if (targetEl) {
                const offsetTop = targetEl.offsetTop;
                scrollContainer.scrollTo({
                    top: offsetTop - 40,
                    behavior: 'smooth'
                });
            }
        });
    });

    if (currentDetailObserver) {
        currentDetailObserver.disconnect();
    }

    const observerOptions = {
        root: scrollContainer,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    currentDetailObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.id;
                newTabs.forEach(t => t.classList.remove('active'));
                const activeTab = detailEl.querySelector(`.geo-tab[data-target="${currentId}"]`);
                if (activeTab) {
                    activeTab.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(sec => {
        currentDetailObserver.observe(sec);
    });

    // --- Detail Progress Animation ---
    scrollContainer.addEventListener('scroll', () => {
        const scrollTop = scrollContainer.scrollTop;
        const containerHeight = scrollContainer.offsetHeight;
        const scrollHeight = scrollContainer.scrollHeight;
        const isAtBottom = scrollTop + containerHeight >= scrollHeight - 5;

        sections.forEach((section, index) => {
            const tab = newTabs[index];
            if (!tab) return;
            const fill = tab.querySelector('.progress-fill');
            if (!fill) return;

            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            let progress = 0;

            // Check if we are currently scrolling through this section
            const isCurrentlyActive = (scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight - 100);

            if (isAtBottom && index === sections.length - 1) {
                // Force last tab to 100% at bottom
                progress = 100;
            } else if (isCurrentlyActive) {
                // Show progress only for the active section
                progress = Math.min(100, Math.max(0, ((scrollTop - (sectionTop - 100)) / (sectionHeight)) * 100));
            } else {
                // Reset to 0 if not active (including scrolled-past sections)
                progress = 0;
            }

            fill.style.height = progress + '%';
        });
    });

    // Load images for this detail view
    loadDetailImages(detailEl);
}

function loadDetailImages(container) {
    // 1. Handle Images
    const images = container.querySelectorAll('.demo-image img');
    images.forEach(img => {
        const parent = img.closest('.demo-image');

        // If image has data-src, it hasn't been started yet
        if (img.getAttribute('data-src')) {
            parent.classList.add('is-loading');
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        }

        // Common loading check (works for data-src swap or normal src)
        if (!img.complete) {
            parent.classList.add('is-loading');
            img.onload = () => parent.classList.remove('is-loading');
            img.onerror = () => parent.classList.remove('is-loading');
        } else {
            parent.classList.remove('is-loading');
        }
    });

    // 2. Handle Videos
    const videos = container.querySelectorAll('.demo-image video');
    videos.forEach(video => {
        const parent = video.closest('.demo-image');

        // Ensure video is played explicitly since it might be hidden initially
        video.play().catch(error => {
            console.log("Autoplay prevented or failed:", error);
        });

        // Videos might take a moment to be ready to play
        if (video.readyState < 3) { // 3 = HAVE_FUTURE_DATA
            parent.classList.add('is-loading');
            video.oncanplay = () => parent.classList.remove('is-loading');
            video.onerror = () => parent.classList.remove('is-loading');
        } else {
            parent.classList.remove('is-loading');
        }

        // 3. Handle Video Progress Bar (if exists)
        const progressBar = parent.querySelector('.video-progress-bar');
        if (progressBar) {
            video.ontimeupdate = () => {
                const percentage = (video.currentTime / video.duration) * 100;
                progressBar.style.width = percentage + '%';
            };
        }
    });
}

function toggleVideoAudio(el) {
    const video = el.querySelector('video');
    if (!video) return;

    if (video.muted) {
        video.muted = false;
        el.classList.add('playing-audio');
    } else {
        video.muted = true;
        el.classList.remove('playing-audio');
    }
}

function toggleVideoPlay(el) {
    const video = el.querySelector('video');
    if (!video) return;

    if (video.paused) {
        video.play();
        el.classList.add('video-playing');
    } else {
        video.pause();
        el.classList.remove('video-playing');
    }
}

// Safe scrolling function for navbar links
window.safeScrollTo = function(target, e) {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof locoScroll !== 'undefined' && locoScroll) {
        locoScroll.scrollTo(target);
    } else {
        const targetEl = document.querySelector(target);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    }
};
