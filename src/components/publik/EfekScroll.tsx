'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const kurangiGerak = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pakaiMouse = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Efek scroll situs publik:
// - Lenis (scroll halus) hanya di desktop dengan mouse, tidak di layar sentuh.
// - GSAP ScrollTrigger: judul seksi dan kartu muncul bertahap saat masuk layar.
// - Parallax tipis pada lingkaran hero di beranda.
// Semua mati saat pengunjung memilih "kurangi gerakan".
// Penyiapan menunggu sinyal "halaman-siap" dari template, supaya tidak mengubah DOM sebelum hidrasi selesai.
export function EfekScroll() {
  useEffect(() => {
    let lenis: Lenis | null = null;
    let tick: ((waktu: number) => void) | null = null;
    let ctx: gsap.Context | null = null;

    if (!kurangiGerak() && pakaiMouse()) {
      lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      const l = lenis;
      tick = (waktu: number) => l.raf(waktu * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    let pantau: ReturnType<typeof setTimeout> | null = null;

    // React menandai tiap elemen yang sudah dihidrasi dengan kunci __reactFiber$.
    // Konten halaman bisa dihidrasi lebih lambat dari template, jadi kita tunggu sampai semua target siap.
    const sudahHidrasi = (el: Element) => Object.keys(el).some((k) => k.startsWith('__reactFiber$'));
    const semuaHidrasi = () =>
      Array.from(document.querySelectorAll('main .sec, main .grid3 > *, main .hero .ring')).every(sudahHidrasi) &&
      !document.querySelector('main .kerangka');

    function siapkan(coba = 0) {
      if (pantau) clearTimeout(pantau);
      if (!semuaHidrasi()) {
        // Maksimal ~6 detik; setelah itu efek dilewati daripada mengubah DOM yang belum dihidrasi.
        if (coba < 120) pantau = setTimeout(() => siapkan(coba + 1), 50);
        return;
      }
      ctx?.revert();
      ctx = null;
      lenis?.scrollTo(0, { immediate: true });
      if (kurangiGerak()) return;

      ctx = gsap.context(() => {
        // Hanya elemen di bawah lipatan layar yang disembunyikan, supaya isi pertama tidak berkedip.
        const target = Array.from(document.querySelectorAll<HTMLElement>('main .sec, main .grid3 > *')).filter(
          (el) => el.getBoundingClientRect().top > window.innerHeight * 0.95,
        );
        if (target.length > 0) {
          gsap.set(target, { opacity: 0, y: 24, transition: 'none' });
          ScrollTrigger.batch(target, {
            start: 'top 92%',
            once: true,
            onEnter: (els) =>
              gsap.to(els, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power3.out',
                stagger: 0.08,
                overwrite: true,
                clearProps: 'opacity,transform,transition',
              }),
          });
        }

        const cincin = document.querySelector('main .hero .ring');
        if (cincin) {
          gsap.to(cincin, {
            y: 60,
            ease: 'none',
            scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
          });
        }
      });
    }

    const mulai = () => siapkan(0);
    window.addEventListener('halaman-siap', mulai);
    if (window.__halamanSiap) mulai();

    return () => {
      window.removeEventListener('halaman-siap', mulai);
      if (pantau) clearTimeout(pantau);
      ctx?.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return null;
}
