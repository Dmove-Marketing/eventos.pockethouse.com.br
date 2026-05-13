/* Scripts extraídos de eventos-corporativos.html */

function scrollToForm() {
            document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => document.getElementById('nome').focus(), 600);
        }

        function handleSubmit(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.textContent = '✓ Solicitação enviada!';
            btn.style.background = '#2a6f6e';
            btn.disabled = true;
            setTimeout(() => {
                btn.innerHTML = 'Solicitar orçamento <svg viewBox="0 0 24 24" style="width:16px;height:16px;fill:none;stroke:white;stroke-width:2;stroke-linecap:round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
                btn.style.background = '';
                btn.disabled = false;
            }, 3000);
        }

        // Intersection Observer para animações ao scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.unit-card, .gallery-item, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });