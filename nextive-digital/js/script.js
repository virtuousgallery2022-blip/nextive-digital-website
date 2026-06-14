const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

class NavigationManager {
    constructor() {
        this.toggle = qs('#nav-toggle');
        this.links = qs('#nav-links');
        this.navbar = qs('.navbar');
        this.init();
    }

    init() {
        if (!this.toggle || !this.links) return;

        this.toggle.addEventListener('click', () => this.toggleMenu());
        qsa('a', this.links).forEach((link) => link.addEventListener('click', () => this.closeMenu()));
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') this.closeMenu();
        });
        document.addEventListener('click', (event) => {
            if (!document.body.classList.contains('menu-open')) return;
            if (this.links.contains(event.target) || this.toggle.contains(event.target)) return;
            this.closeMenu();
        });

        this.updateActiveLink();
        this.handleScroll();
        window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }

    toggleMenu() {
        const isOpen = this.links.classList.toggle('active');
        this.toggle.classList.toggle('active', isOpen);
        this.toggle.setAttribute('aria-expanded', String(isOpen));
        this.toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('menu-open', isOpen);
    }

    closeMenu() {
        this.links.classList.remove('active');
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('menu-open');
    }

    handleScroll() {
        if (!this.navbar) return;
        this.navbar.classList.toggle('scrolled', window.scrollY > 28);
    }

    updateActiveLink() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        qsa('a', this.links).forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#')) return;
            link.classList.toggle('active', href === page);
        });
    }
}

class RevealOnScroll {
    constructor() {
        this.elements = qsa('.fade-up');
        this.init();
    }

    init() {
        if (!this.elements.length) return;
        if (!('IntersectionObserver' in window) || prefersReducedMotion) {
            this.elements.forEach((element) => element.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -70px 0px'
        });

        this.elements.forEach((element, index) => {
            element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
            observer.observe(element);
        });
    }
}

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        qsa('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') return;
                const target = qs(href);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
            });
        });
    }
}

class TiltCards {
    constructor() {
        this.cards = qsa('.client-card, .solution-card, .process-step');
        this.pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        this.init();
    }

    init() {
        if (!this.pointerFine || prefersReducedMotion) return;

        this.cards.forEach((card) => {
            card.addEventListener('mousemove', (event) => this.onMove(event, card));
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    onMove(event, card) {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-8px)`;
    }
}

class FormHandler {
    constructor() {
        this.form = qs('#contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        this.form.addEventListener('submit', (event) => {
            const name = qs('[name="name"]', this.form);
            const email = qs('[name="email"]', this.form);
            const message = qs('[name="message"]', this.form);

            if (!name?.value.trim() || !email?.value.trim() || !message?.value.trim()) {
                event.preventDefault();
                window.alert('Please fill in your name, email, and message.');
            }
        });
    }
}

class MarqueeTrack {
    constructor() {
        this.track = qs('.signal-track');
        this.init();
    }

    init() {
        if (!this.track) return;
        const items = qsa('span', this.track);
        items.forEach((item) => this.track.appendChild(item.cloneNode(true)));
    }
}

class AmbientDepth {
    constructor() {
        this.pointer = { x: 0, y: 0 };
        this.ticking = false;
        this.init();
    }

    init() {
        if (prefersReducedMotion) return;
        this.createLayer();
        this.updateScrollVars();

        window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
        window.addEventListener('resize', () => this.requestUpdate(), { passive: true });
        window.addEventListener('pointermove', (event) => {
            this.pointer.x = (event.clientX / window.innerWidth - 0.5).toFixed(4);
            this.pointer.y = (event.clientY / window.innerHeight - 0.5).toFixed(4);
            document.documentElement.style.setProperty('--pointer-x', this.pointer.x);
            document.documentElement.style.setProperty('--pointer-y', this.pointer.y);
        }, { passive: true });
    }

    createLayer() {
        if (qs('.ambient-depth')) return;

        const layer = document.createElement('div');
        layer.className = 'ambient-depth';
        layer.setAttribute('aria-hidden', 'true');
        layer.innerHTML = `
            <span class="depth-ring"></span>
            <span class="depth-ring depth-ring-two"></span>
            <span class="depth-plane"></span>
            <span class="depth-plane depth-plane-two"></span>
            <span class="depth-type">NEXTIVE</span>
        `;
        document.body.prepend(layer);
        document.body.classList.add('depth-enabled');
    }

    requestUpdate() {
        if (this.ticking) return;
        this.ticking = true;
        requestAnimationFrame(() => {
            this.updateScrollVars();
            this.ticking = false;
        });
    }

    updateScrollVars() {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const ratio = Math.min(Math.max(window.scrollY / max, 0), 1);
        document.documentElement.style.setProperty('--scroll-ratio', ratio.toFixed(4));
    }
}

class TechSound {
    constructor() {
        this.storageKey = 'nextive-sound-preference';
        this.context = null;
        this.master = null;
        this.nodes = [];
        this.sequenceTimer = null;
        this.step = 0;
        this.isPlaying = false;
        this.button = null;
        this.label = null;
        this.userPref = this.getStoredPreference();
        this.notes = [55, 61.74, 73.42, 82.41, 98, 110, 123.47, 146.83];
        this.chordRoots = [55, 49, 65.41, 41.2];
        this.init();
    }

    init() {
        this.createButton();

        if (this.userPref !== 'off') {
            this.updateButton('locked');
            this.start(false);
            this.addUnlockListeners();
        } else {
            this.updateButton('off');
        }

        document.addEventListener('visibilitychange', () => {
            if (!this.context || !this.isPlaying) return;
            if (document.hidden) {
                this.context.suspend();
            } else {
                this.context.resume();
            }
        });
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'sound-toggle';
        this.button.setAttribute('aria-pressed', 'false');
        this.button.setAttribute('aria-label', 'Enable cinematic space sound');
        this.button.innerHTML = `
            <span class="sound-toggle__bars" aria-hidden="true"><span></span><span></span><span></span></span>
            <span class="sound-toggle__label">Space Sound</span>
        `;
        this.label = qs('.sound-toggle__label', this.button);
        this.button.addEventListener('click', () => this.toggle());
        document.body.appendChild(this.button);
    }

    addUnlockListeners() {
        const unlock = () => {
            if (!this.isPlaying && this.userPref !== 'off') this.start(true);
            document.removeEventListener('pointerdown', unlock);
            document.removeEventListener('keydown', unlock);
        };
        document.addEventListener('pointerdown', unlock, { passive: true });
        document.addEventListener('keydown', unlock);
    }

    async toggle() {
        if (this.isPlaying) {
            this.stop();
            this.storePreference('off');
            return;
        }

        this.storePreference('on');
        await this.start(true);
    }

    async start(fromGesture) {
        if (!this.context) this.createAudioGraph();
        if (!this.context || !this.master) return;

        try {
            await this.context.resume();
        } catch (error) {
            this.updateButton('waiting');
            return;
        }

        if (this.context.state !== 'running') {
            this.updateButton(fromGesture ? 'waiting' : 'locked');
            return;
        }

        const now = this.context.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setTargetAtTime(0.046, now, 0.9);
        this.startSequencer();
        this.isPlaying = true;
        this.updateButton('playing');
    }

    stop() {
        if (!this.context || !this.master) return;
        const now = this.context.currentTime;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setTargetAtTime(0, now, 0.18);
        window.setTimeout(() => {
            if (this.context && this.context.state === 'running') this.context.suspend();
        }, 320);
        window.clearInterval(this.sequenceTimer);
        this.sequenceTimer = null;
        this.isPlaying = false;
        this.updateButton('off');
    }

    createAudioGraph() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            this.updateButton('unsupported');
            return;
        }

        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0;

        const compressor = this.context.createDynamicsCompressor();
        compressor.threshold.value = -30;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.024;
        compressor.release.value = 0.48;

        const delay = this.context.createDelay(2);
        delay.delayTime.value = 0.46;
        const feedback = this.context.createGain();
        feedback.gain.value = 0.28;
        delay.connect(feedback);
        feedback.connect(delay);

        const pad = this.createPad();
        pad.output.connect(delay);
        pad.output.connect(this.master);
        delay.connect(this.master);

        const bass = this.createBass();
        bass.output.connect(this.master);

        this.master.connect(compressor);
        compressor.connect(this.context.destination);
        this.nodes.push(...pad.nodes, ...bass.nodes, delay, feedback, compressor, this.master);
    }

    createPad() {
        const output = this.context.createGain();
        output.gain.value = 0.24;

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 760;
        filter.Q.value = 0.85;

        const lfo = this.context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.026;
        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 170;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const chord = [55, 82.41, 110, 146.83];
        const detunes = [-7, 3, 8, -3];
        const oscillators = chord.map((frequency, index) => {
            const osc = this.context.createOscillator();
            osc.type = index % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.value = frequency;
            osc.detune.value = detunes[index];
            osc.connect(filter);
            osc.start();
            return osc;
        });

        filter.connect(output);
        lfo.start();

        return { output, nodes: [output, filter, lfo, lfoGain, ...oscillators] };
    }

    createBass() {
        const output = this.context.createGain();
        output.gain.value = 0.16;

        const bassA = this.context.createOscillator();
        const bassB = this.context.createOscillator();
        bassA.type = 'sine';
        bassB.type = 'triangle';
        bassA.frequency.value = 27.5;
        bassB.frequency.value = 55;
        bassB.detune.value = -6;

        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 96;
        filter.Q.value = 3.2;

        const lfo = this.context.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.052;
        const lfoGain = this.context.createGain();
        lfoGain.gain.value = 18;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        bassA.connect(filter);
        bassB.connect(filter);
        filter.connect(output);
        bassA.start();
        bassB.start();
        lfo.start();

        return { output, nodes: [output, bassA, bassB, filter, lfo, lfoGain] };
    }

    startSequencer() {
        if (this.sequenceTimer) return;
        this.playPulse();
        this.sequenceTimer = window.setInterval(() => this.playPulse(), 420);
    }

    playPulse() {
        if (!this.context || this.context.state !== 'running') return;

        const now = this.context.currentTime;
        const note = this.notes[(this.step * 2) % this.notes.length] * (this.step % 8 === 0 ? 0.5 : 1);
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        osc.type = this.step % 4 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(note, now);
        osc.frequency.exponentialRampToValueAtTime(note * 1.008, now + 0.16);
        filter.type = 'bandpass';
        filter.frequency.value = this.step % 4 === 0 ? 520 : 1320;
        filter.Q.value = 8;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.step % 4 === 0 ? 0.08 : 0.034, now + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.38);

        if (this.step % 8 === 0) this.playBassSwell(now);
        if (this.step % 16 === 4) this.playStarChord(now);

        this.step = (this.step + 1) % 32;
    }

    playBassSwell(now) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        const root = this.chordRoots[(this.step / 8) % this.chordRoots.length];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(root * 0.5, now);
        osc.frequency.exponentialRampToValueAtTime(root * 0.505, now + 1.4);
        filter.type = 'lowpass';
        filter.frequency.value = 140;
        filter.Q.value = 2.4;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 1.7);
    }

    playStarChord(now) {
        const root = this.chordRoots[((this.step + 4) / 8) % this.chordRoots.length];
        const chord = [root, root * 1.5, root * 2, root * 2.5];

        chord.forEach((frequency, index) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            const filter = this.context.createBiquadFilter();

            osc.type = index % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.value = frequency;
            osc.detune.value = index * 5 - 7;
            filter.type = 'bandpass';
            filter.frequency.value = 820 + index * 210;
            filter.Q.value = 3.5;

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.026, now + 0.08 + index * 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            osc.start(now + index * 0.025);
            osc.stop(now + 1.9);
        });
    }

    updateButton(state) {
        if (!this.button || !this.label) return;
        const states = {
            playing: ['Space Sound On', true, 'Disable cinematic space sound'],
            off: ['Sound Off', false, 'Enable cinematic space sound'],
            locked: ['Space Sound', false, 'Enable cinematic space sound'],
            waiting: ['Space Sound', false, 'Enable cinematic space sound'],
            unsupported: ['Sound Unavailable', false, 'Ambient sound is not supported in this browser']
        };
        const [label, pressed, ariaLabel] = states[state] || states.off;
        this.label.textContent = label;
        this.button.classList.toggle('is-playing', pressed);
        this.button.setAttribute('aria-pressed', String(pressed));
        this.button.setAttribute('aria-label', ariaLabel);
    }

    getStoredPreference() {
        try {
            return window.localStorage.getItem(this.storageKey);
        } catch (error) {
            return null;
        }
    }

    storePreference(value) {
        this.userPref = value;
        try {
            window.localStorage.setItem(this.storageKey, value);
        } catch (error) {
            this.userPref = value;
        }
    }
}

class HeroScene {
    constructor() {
        this.canvas = qs('#hero-stage');
        this.pointer = { x: 0, y: 0 };
        this.clock = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.stage = null;
        this.grid = null;
        this.init();
    }

    init() {
        if (!this.canvas) return;
        if (prefersReducedMotion || !window.THREE) {
            this.canvas.classList.add('hero-stage--fallback');
            return;
        }

        try {
            const THREE = window.THREE;
            this.clock = new THREE.Clock();
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
            this.camera.position.set(0, 0.15, 7.3);

            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance'
            });
            this.renderer.setClearColor(0x000000, 0);
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;

            this.addLighting(THREE);
            this.addStage(THREE);
            this.addListeners();
            this.resize();
            this.animate();
        } catch (error) {
            this.canvas.classList.add('hero-stage--fallback');
            console.warn('Hero scene fallback:', error);
        }
    }

    addLighting(THREE) {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        const key = new THREE.DirectionalLight(0x35e89a, 1.4);
        const rim = new THREE.DirectionalLight(0xff6b4a, 1.2);
        key.position.set(4, 5, 5);
        rim.position.set(-5, 2, 3);
        this.scene.add(ambient, key, rim);
    }

    addStage(THREE) {
        this.stage = new THREE.Group();
        this.scene.add(this.stage);

        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x35e89a,
            emissive: 0x0b3b25,
            metalness: 0.42,
            roughness: 0.24,
            transparent: true,
            opacity: 0.8
        });
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x3ed7ff,
            wireframe: true,
            transparent: true,
            opacity: 0.28
        });

        const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1.22, 0.16, 180, 18), coreMaterial);
        const torusWire = new THREE.Mesh(new THREE.TorusKnotGeometry(1.42, 0.055, 180, 12), wireMaterial);
        torus.rotation.x = 0.6;
        torusWire.rotation.x = 0.6;
        this.stage.add(torus, torusWire);

        const frameMaterial = new THREE.LineBasicMaterial({ color: 0xf0b44d, transparent: true, opacity: 0.62 });
        for (let i = 0; i < 3; i += 1) {
            const box = new THREE.BoxGeometry(0.86 + i * 0.34, 0.86 + i * 0.34, 0.86 + i * 0.34);
            const frame = new THREE.LineSegments(new THREE.EdgesGeometry(box), frameMaterial);
            frame.rotation.set(i * 0.35, i * 0.24, i * 0.19);
            this.stage.add(frame);
        }

        const slabMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6b4a,
            emissive: 0x34120c,
            metalness: 0.22,
            roughness: 0.5,
            transparent: true,
            opacity: 0.78
        });
        for (let i = 0; i < 5; i += 1) {
            const slab = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.06, 0.48), slabMaterial);
            slab.position.set(-2.2 + i * 1.1, -1.75 + (i % 2) * 0.22, -0.62 - i * 0.12);
            slab.rotation.set(0.24, -0.45, 0.08);
            this.stage.add(slab);
        }

        this.grid = this.createGrid(THREE);
        this.scene.add(this.grid);
    }

    createGrid(THREE) {
        const positions = [];
        const size = 13;
        const divisions = 18;
        const step = size / divisions;
        const half = size / 2;

        for (let i = 0; i <= divisions; i += 1) {
            const p = -half + i * step;
            positions.push(-half, -2.25, p, half, -2.25, p);
            positions.push(p, -2.25, -half, p, -2.25, half);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color: 0x35e89a, transparent: true, opacity: 0.22 });
        const grid = new THREE.LineSegments(geometry, material);
        grid.rotation.x = 0.08;
        return grid;
    }

    addListeners() {
        window.addEventListener('resize', () => this.resize(), { passive: true });
        window.addEventListener('pointermove', (event) => {
            this.pointer.x = event.clientX / window.innerWidth - 0.5;
            this.pointer.y = event.clientY / window.innerHeight - 0.5;
        }, { passive: true });
    }

    resize() {
        if (!this.renderer || !this.camera) return;
        const width = this.canvas.clientWidth || window.innerWidth;
        const height = this.canvas.clientHeight || window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        this.renderer.setSize(width, height, false);

        if (this.stage) {
            const mobile = width < 820;
            this.stage.position.set(mobile ? 0 : 1.6, mobile ? -0.2 : 0.1, 0);
            this.stage.scale.setScalar(mobile ? 0.82 : 1);
        }
    }

    animate() {
        if (!this.renderer || !this.scene || !this.camera) return;
        const THREE = window.THREE;
        const time = this.clock.getElapsedTime();

        this.stage.rotation.y = time * 0.18 + this.pointer.x * 0.38;
        this.stage.rotation.x = Math.sin(time * 0.45) * 0.08 + this.pointer.y * 0.22;
        this.stage.children.forEach((child, index) => {
            child.rotation.z += 0.0018 * (index + 1);
        });

        if (this.grid) {
            this.grid.position.z = (time * 0.42) % 0.72;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    new RevealOnScroll();
    new SmoothScroll();
    new TiltCards();
    new FormHandler();
    new MarqueeTrack();
    new AmbientDepth();
    new TechSound();
    new HeroScene();
});
