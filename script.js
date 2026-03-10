

// --- 0. Custom Cursor Logic ---
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

let posX = 0, posY = 0;
let mouseX = 0, mouseY = 0;
let pageMouseX = 0, pageMouseY = 0;

if (cursor && follower) {
    // Quick setters for performance
    const xCursorSetter = gsap.quickSetter(cursor, "x", "px");
    const yCursorSetter = gsap.quickSetter(cursor, "y", "px");
    const xFollowerSetter = gsap.quickSetter(follower, "x", "px");
    const yFollowerSetter = gsap.quickSetter(follower, "y", "px");

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
        xCursorSetter(mouseX - 4); // half of 8px
        yCursorSetter(mouseY - 4);

        // Position follower with lag
        xFollowerSetter(posX - 20); // half of 40px
        yFollowerSetter(posY - 20);

        // Update Flashlight position
        document.documentElement.style.setProperty('--flashlight-x', `${mouseX}px`);
        document.documentElement.style.setProperty('--flashlight-y', `${mouseY}px`);
    });


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

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// --- 1. Locomotive Scroll Setup ---
const locoScroll = new LocomotiveScroll({
    el: document.querySelector('#main-content'), // We need a wrapper for Locomotive
    smooth: true,
    lerp: 0.1, // Linear Interpolation, 0.1 is standard smooth
    multiplier: 1.0, // Scroll speed multiplier
    tablet: { smooth: true },
    smartphone: { smooth: true }
});

// Update ScrollTrigger on Locomotive Scroll event
locoScroll.on("scroll", ScrollTrigger.update);

// Tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element
ScrollTrigger.scrollerProxy("#main-content", {
    scrollTop(value) {
        return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    // Locomotive Scroll handles things completely differently on mobile devices - it doesn't even transform the container at all! 
    // So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. 
    // We sense it by checking to see if there's a transform applied to the container (the Locomotive Scroll-controlled element).
    pinType: document.querySelector("#main-content").style.transform ? "transform" : "fixed"
});

// Refresh ScrollTrigger when window updates
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
ScrollTrigger.refresh();

// --- 1.5 Flashlight Interaction ---
ScrollTrigger.create({
    trigger: "#work",
    scroller: "#main-content",
    start: "top 80%", // Starts fading when #work hits 80% of viewport
    onEnter: () => {
        const flashlight = document.querySelector('.flashlight');
        if (flashlight) flashlight.style.opacity = 0;
    },
    onLeaveBack: () => {
        const flashlight = document.querySelector('.flashlight');
        if (flashlight && !document.body.classList.contains('detail-active')) {
            flashlight.style.opacity = 1;
        }
    }
});

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
const titles = document.querySelectorAll('.scramble-text');

titles.forEach((el) => {
    const fx = new TextScramble(el);
    const finalText = el.innerText; // Store the original text

    // Clear initially to create the "search" effect from nothing
    el.innerHTML = '&nbsp;';

    ScrollTrigger.create({
        trigger: el,
        scroller: "#main-content", // Connect to Locomotive
        start: "top 90%", // Start when top of element hits 90% of viewport height
        onEnter: () => {
            el.style.opacity = 1;
            fx.setText(finalText);
        },
        // Optional: Re-play on re-entry?
        // onEnterBack: () => fx.setText(finalText) 
    });
});

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

    // Use Font Loading API to wait for fonts being ready
    document.fonts.ready.then(() => {
        // Progress animation to 100%
        progressTL.to(bar, {
            width: '100%',
            duration: 1.5,
            ease: "power2.inOut",
            onComplete: () => {
                // Subtle pause before exit
                setTimeout(() => {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 0.8,
                        onComplete: () => {
                            loader.style.display = 'none';
                            body.classList.add('loaded');
                            if (typeof locoScroll !== 'undefined') {
                                ScrollTrigger.refresh();
                                locoScroll.update();
                            }
                        }
                    });
                }, 200);
            }
        });
    });

    // Fallback: If fonts take too long, still show the site
    setTimeout(() => {
        if (!body.classList.contains('loaded')) {
            gsap.to(loader, {
                opacity: 0, duration: 0.8, onComplete: () => {
                    loader.style.display = 'none';
                    body.classList.add('loaded');
                }
            });
        }
    }, 5000);
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

        sections.forEach((section, index) => {
            const tab = newTabs[index];
            if (!tab) return;
            const fill = tab.querySelector('.progress-fill');
            if (!fill) return;

            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            // Adjust markers for "active" state
            // Section is active if it takes up the middle of the screen
            const isActive = scrollTop >= sectionTop - 100 && scrollTop < sectionTop + sectionHeight - 100;

            let progress = 0;
            if (isActive) {
                // Progress within this section [0-100]
                progress = Math.min(100, Math.max(0, ((scrollTop - (sectionTop - 100)) / (sectionHeight)) * 100));
            } else {
                // If not active (scrolled past or not reached), reset to 0
                progress = 0;
            }

            fill.style.height = progress + '%';
        });
    });

    // Load images for this detail view
    loadDetailImages(detailEl);
}

function loadDetailImages(container) {
    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => {
        if (img.getAttribute('data-src')) {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        }
    });
}
