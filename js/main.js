document.addEventListener('DOMContentLoaded', () => {
    // Obsługa przełączania motywu
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Funkcja sprawdzająca czy jest noc (między 20:00 a 6:00)
    const isNightTime = () => {
        const hour = new Date().getHours();
        return hour >= 20 || hour < 6;
    };

    // Funkcja aktualizacji ikony motywu
    const updateThemeIcon = (isDark) => {
        themeToggle.textContent = isDark ? '☀️' : '🌓';
    };

    // Funkcja ustawiania motywu
    const setTheme = (isDark) => {
        document.body.classList.toggle('dark-theme', isDark);
        updateThemeIcon(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    // Sprawdź zapisane preferencje lub ustaw motyw na podstawie pory dnia
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme === 'dark');
    } else {
        setTheme(isNightTime() || prefersDarkScheme.matches);
    }

    // Obsługa kliknięcia przycisku
    themeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('dark-theme');
        setTheme(isDark);
        localStorage.setItem('theme-auto', 'false');
    });

    // Automatyczna zmiana motywu o wschodzie i zachodzie słońca
    const checkDayNightCycle = () => {
        const isAuto = localStorage.getItem('theme-auto') !== 'false';
        if (isAuto) {
            setTheme(isNightTime());
        }
    };

    // Sprawdzaj porę dnia co minutę
    setInterval(checkDayNightCycle, 60000);
    checkDayNightCycle();

    // Obsługa zmiany preferencji systemowych
    prefersDarkScheme.addEventListener('change', (e) => {
        const isAuto = localStorage.getItem('theme-auto') !== 'false';
        if (isAuto) {
            setTheme(isNightTime() || e.matches);
        }
    });

    // Płynne przewijanie z obsługą historii
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Aktualizacja URL bez przeładowania strony
                history.pushState(null, '', this.getAttribute('href'));
            }
        });
    });

    // Obserwator przecięcia dla animacji
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                // Przestań obserwować element po animacji
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    
    // Menu mobilne z obsługą dostępności
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Zamykanie menu po kliknięciu poza nim
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Animacja elementów podczas przewijania
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight * 0.9 && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    };

    // Inicjalizacja animacji
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('resize', animateOnScroll);

    // Dodaj efekt parallax dla tła hero
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }

    // Generowanie losowych obrazów dla artykułów
    const randomImages = [
        'https://source.unsplash.com/random/800x600/?programming',
        'https://source.unsplash.com/random/800x600/?technology',
        'https://source.unsplash.com/random/800x600/?computer',
        'https://source.unsplash.com/random/800x600/?coding'
    ];

    // Pobieranie i renderowanie artykułów z plików Markdown
    async function loadBlogPosts() {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        try {
            const response = await fetch('/blog');
            const posts = await response.json();
            
            blogGrid.innerHTML = posts.map((post, index) => `
                <article class="blog-card animate-on-scroll ${index % 2 === 0 ? 'slide-in-left' : 'slide-in-right'}">
                    <div class="blog-image">
                        <img src="${post.image || randomImages[index % randomImages.length]}" 
                             alt="${post.title}" loading="lazy">
                    </div>
                    <div class="blog-content">
                        <h3>${post.title}</h3>
                        <p class="blog-excerpt">${post.excerpt}</p>
                        <div class="blog-meta">
                            <span class="blog-date">${post.date}</span>
                            <a href="/blog/${post.slug}" class="read-more">Czytaj więcej</a>
                        </div>
                    </div>
                </article>
            `).join('');
        } catch (error) {
            console.error('Błąd podczas ładowania artykułów:', error);
        }
    }

    // Inicjalizacja ładowania artykułów
    loadBlogPosts();

    // Optymalizacja obrazów
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            // Dodaj placeholder podczas ładowania
            img.style.backgroundColor = '#f0f0f0';
            img.addEventListener('load', () => {
                img.style.backgroundColor = 'transparent';
            });
        });
    } else {
        // Fallback dla starszych przeglądarek
        const lazyLoad = () => {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        };

        if ('IntersectionObserver' in window) {
            lazyLoad();
        } else {
            // Fallback dla bardzo starych przeglądarek
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }

    // Easter Egg - Kod Konami
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    // Tablica emoji związanych z programowaniem
    const codeEmojis = ['💻', '⌨️', '🖥️', '📱', '🤖', '👾', '🎮', '🕹️', '💾', '📂', '🗂️', '📊', '📈', '🔍', '⚡'];

    // Funkcja tworząca spadający emoji
    const createFallingEmoji = () => {
        const emoji = document.createElement('div');
        emoji.className = 'falling-emoji';
        emoji.textContent = codeEmojis[Math.floor(Math.random() * codeEmojis.length)];
        emoji.style.left = Math.random() * window.innerWidth + 'px';
        emoji.style.animationDuration = (Math.random() * 2 + 1) + 's';
        document.body.appendChild(emoji);

        // Usuń emoji po zakończeniu animacji
        emoji.addEventListener('animationend', () => {
            emoji.remove();
        });
    };

    // Easter Egg - zmienne kontrolne
    let isEmojisFalling = false;
    let emojiInterval = null;
    let dKeyCount = 0;
    let nKeyCount = 0;
    let lastKeyTime = Date.now();
    const KEY_TIMEOUT = 1000; // 1 sekunda na wpisanie sekwencji

    // Funkcja mrugania ekranem
    const screenFlash = () => {
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 10000;
            pointer-events: none;
            animation: flash 0.5s ease-in-out infinite;
        `;

        const flashStyle = document.createElement('style');
        flashStyle.textContent = `
            @keyframes flash {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(flashStyle);
        document.body.appendChild(flashOverlay);

        // Mruganie przez 5 sekund
        setTimeout(() => {
            flashOverlay.remove();
            flashStyle.remove();
        }, 5000);
    };

    // Zmodyfikowana funkcja aktywacji spadających emoji
    const startEmojisFalling = () => {
        if (isEmojisFalling) return;
        isEmojisFalling = true;

        // Dodaj style dla animacji
        if (!document.querySelector('#easter-egg-style')) {
            const style = document.createElement('style');
            style.id = 'easter-egg-style';
            style.textContent = `
                @keyframes emojifall {
                    0% {
                        transform: translateY(-20px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0.9;
                    }
                }
                .falling-emoji {
                    position: fixed;
                    top: -20px;
                    font-size: 24px;
                    z-index: 9999;
                    pointer-events: none;
                    animation: emojifall linear forwards;
                }
            `;
            document.head.appendChild(style);
        }

        let emojiCount = 1;
        let maxEmojisPerInterval = 1;
        let intervalSpeed = 100;

        // Funkcja zwiększająca intensywność spadania emoji
        const increaseIntensity = () => {
            maxEmojisPerInterval++;
            if (intervalSpeed > 20) {
                intervalSpeed -= 5;
                clearInterval(emojiInterval);
                startFalling();
            }
        };

        // Funkcja rozpoczynająca spadanie z aktualną prędkością
        const startFalling = () => {
            emojiInterval = setInterval(() => {
                for (let i = 0; i < maxEmojisPerInterval; i++) {
                    createFallingEmoji();
                    emojiCount++;
                }
            }, intervalSpeed);
        };

        // Zwiększaj intensywność co 2 sekundy
        const intensityInterval = setInterval(() => {
            increaseIntensity();
            if (maxEmojisPerInterval >= 20) {
                clearInterval(intensityInterval);
            }
        }, 2000);

        // Rozpocznij spadanie
        startFalling();
    };

    // Funkcja zatrzymująca spadanie emoji
    const stopEmojisFalling = () => {
        if (!isEmojisFalling) return;
        isEmojisFalling = false;
        clearInterval(emojiInterval);
        // Usuń wszystkie spadające emoji
        document.querySelectorAll('.falling-emoji').forEach(emoji => emoji.remove());
    };

    // Obsługa klawiszy
    document.addEventListener('keydown', (e) => {
        const currentTime = Date.now();

        // Resetuj liczniki jeśli minęło zbyt dużo czasu
        if (currentTime - lastKeyTime > KEY_TIMEOUT) {
            dKeyCount = 0;
            nKeyCount = 0;
        }
        lastKeyTime = currentTime;

        // Obsługa kodu Konami
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                startEmojisFalling();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }

        // Obsługa klawisza 's' - stop emoji
        if (e.key.toLowerCase() === 's') {
            stopEmojisFalling();
        }

        // Obsługa sekwencji 'ddd' i 'nnn'
        if (e.key.toLowerCase() === 'd') {
            dKeyCount++;
            if (dKeyCount === 3) {
                if (!document.body.classList.contains('dark-theme')) {
                    screenFlash();
                }
                setTheme(false);
                dKeyCount = 0;
            }
        } else if (e.key.toLowerCase() === 'n') {
            nKeyCount++;
            if (nKeyCount === 3) {
                if (document.body.classList.contains('dark-theme')) {
                    screenFlash();
                }
                setTheme(true);
                nKeyCount = 0;
            }
        } else {
            // Resetuj liczniki przy innym klawiszu
            dKeyCount = 0;
            nKeyCount = 0;
        }
    });
}); 