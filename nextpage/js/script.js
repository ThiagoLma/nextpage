(function() {
        'use strict';

        const STORAGE_KEY = 'nextpage_projects_v1';

        const COVER_GRADIENTS = [
            'linear-gradient(135deg, #18181b, #2e1065)',
            'linear-gradient(135deg, #141414, #043c2e)',
            'linear-gradient(135deg, #161616, #102a43)',
            'linear-gradient(135deg, #171717, #3f2500)',
            'linear-gradient(135deg, #191919, #3b0764)',
            'linear-gradient(135deg, #151515, #0a3d44)',
            'linear-gradient(135deg, #161616, #3d0a2c)',
            'linear-gradient(135deg, #1c1917, #2e1065)'
        ];

        const STATUS_META = {
            planned: { label: 'Planejado', css: 'status-planned' },
            progress: { label: 'Em andamento', css: 'status-progress' },
            review: { label: 'Em revisão', css: 'status-review' },
            done: { label: 'Concluído', css: 'status-done' }
        };

        const STATUS_KEYS = Object.keys(STATUS_META);

        const DEFAULT_PROJECTS = [
            {
                id: 'p1',
                name: 'NovaTech',
                url: '#',
                category: 'Sistema Web',
                status: 'done',
                tech: ['React', 'Node.js', 'PostgreSQL'],
                desc: 'Plataforma completa de gestão empresarial com dashboards e relatórios em tempo real.',
                date: '2024-11-15',
                color: 0
            },
            {
                id: 'p2',
                name: 'VidaFit',
                url: '#',
                category: 'E-commerce',
                status: 'review',
                tech: ['Next.js', 'Stripe', 'Tailwind'],
                desc: 'Loja virtual de suplementos com sistema de assinaturas e área do cliente.',
                date: '2025-02-03',
                color: 1
            },
            {
                id: 'p3',
                name: 'EcoSolutions',
                url: '#',
                category: 'Landing Page',
                status: 'progress',
                tech: ['HTML', 'CSS', 'JavaScript'],
                desc: 'Site institucional com integração de formulários e sistema de agendamento.',
                date: '2025-05-20',
                color: 2
            },
            {
                id: 'p4',
                name: 'nextpage (este site)',
                url: 'fyrn.html',
                category: 'Landing Page',
                status: 'done',
                tech: ['HTML', 'CSS', 'JavaScript'],
                desc: 'Landing page moderna para a própria agência, com tema escuro e acento roxo elétrico.',
                date: '2025-06-29',
                color: 5
            }
        ];

        let projects = loadProjects();
        let currentFilter = 'all';
        let searchQuery = '';
        let editingId = null;

        const grid = document.getElementById('projectsGrid');
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const toast = document.getElementById('toast');

        // ---------- Storage ----------
        function loadProjects() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) {}
            return DEFAULT_PROJECTS.map(function(p) { return Object.assign({}, p); });
        }

        function saveProjects() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
            } catch (e) {}
        }

        // ---------- Utils ----------
        function getInitials(name) {
            var parts = name.trim().split(/\s+/);
            if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }

        function formatDate(iso) {
            if (!iso) return '';
            var d = new Date(iso);
            if (isNaN(d.getTime())) return iso;
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        function getCoverColor(project) {
            var idx = typeof project.color === 'number' ? project.color : 0;
            return COVER_GRADIENTS[idx % COVER_GRADIENTS.length];
        }

        function escapeHtml(str) {
            var div = document.createElement('div');
            div.textContent = String(str || '');
            return div.innerHTML;
        }

        // ---------- Rendering ----------
        function getFilteredProjects() {
            return projects.filter(function(p) {
                if (currentFilter !== 'all' && p.status !== currentFilter) return false;
                if (searchQuery) {
                    var q = searchQuery.toLowerCase();
                    var hay = (p.name + ' ' + (p.category || '') + ' ' + (p.desc || '')).toLowerCase();
                    if (hay.indexOf(q) === -1) return false;
                }
                return true;
            });
        }

        function renderStats() {
            var total = projects.length;
            var done = projects.filter(function(p) { return p.status === 'done'; }).length;
            var progress = projects.filter(function(p) { return p.status === 'progress'; }).length;
            var review = projects.filter(function(p) { return p.status === 'review'; }).length;

            document.getElementById('statTotal').textContent = total;
            document.getElementById('statDone').textContent = done;
            document.getElementById('statProgress').textContent = progress;
            document.getElementById('statReview').textContent = review;
        }

        function renderProjects() {
            var filtered = getFilteredProjects();

            renderStats();

            if (filtered.length === 0) {
                grid.innerHTML =
                    '<div class="empty-state">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
                            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>' +
                            '<polyline points="14 2 14 8 20 8"></polyline>' +
                        '</svg>' +
                        '<h3>Nenhum projeto encontrado</h3>' +
                        '<p>' + (projects.length === 0 ? 'Adicione seu primeiro projeto no arquivo de origem.' : 'Ajuste a busca ou os filtros para ver mais resultados.') + '</p>' +
                    '</div>';
                return;
            }

            grid.innerHTML = filtered.map(function(p) {
                var meta = STATUS_META[p.status] || STATUS_META.planned;
                var initials = getInitials(p.name);
                var tags = (p.tech || []).map(function(t) {
                    return '<span class="tag">' + escapeHtml(t) + '</span>';
                }).join('');
                var safeUrl = p.url && p.url !== '#' ? p.url : '#';
                var hasLink = p.url && p.url !== '#';

                return (
                    '<article class="project-card" data-id="' + p.id + '">' +
                        '<div class="project-cover" style="background: ' + getCoverColor(p) + '" data-open="' + p.id + '">' +
                            '<span class="project-initials">' + escapeHtml(initials) + '</span>' +
                            '<div class="project-cover-overlay">' +
                                '<span class="btn btn-primary">' + (hasLink ? 'Abrir Projeto' : 'Sem link') + '</span>' +
                            '</div>' +
                            '<span class="project-status ' + meta.css + '">' + meta.label + '</span>' +
                        '</div>' +
                        '<div class="project-body">' +
                            '<span class="project-category">' + escapeHtml(p.category || '') + '</span>' +
                            '<h3 class="project-name">' + escapeHtml(p.name) + '</h3>' +
                            '<p class="project-desc">' + escapeHtml(p.desc || '') + '</p>' +
                            (tags ? '<div class="project-tags">' + tags + '</div>' : '') +
                            '<div class="project-footer">' +
                                '<span class="project-date">' + (p.date ? formatDate(p.date) : 'Sem data') + '</span>' +
                                '<div class="project-actions">' +
                                    (hasLink ?
                                    '<a href="' + safeUrl + '" target="_blank" rel="noopener" class="project-link-btn">' +
                                        'Abrir' +
                                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
                                            '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>' +
                                            '<polyline points="15 3 21 3 21 9"></polyline>' +
                                            '<line x1="10" y1="14" x2="21" y2="3"></line>' +
                                        '</svg>' +
                                    '</a>' : '') +
                                    '<button class="btn-icon" data-edit="' + p.id + '" aria-label="Editar" title="Editar">' +
                                        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                            '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>' +
                                        '</svg>' +
                                    '</button>' +
                                    '<button class="btn-icon danger" data-delete="' + p.id + '" aria-label="Excluir" title="Excluir">' +
                                        '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                                            '<polyline points="3 6 5 6 21 6"></polyline>' +
                                            '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
                                            '<line x1="10" y1="11" x2="10" y2="17"></line>' +
                                            '<line x1="14" y1="11" x2="14" y2="17"></line>' +
                                        '</svg>' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</article>'
                );
            }).join('');
        }

        // ---------- Toast ----------
        var toastTimer = null;
        function showToast(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(function() {
                toast.classList.remove('show');
            }, 2600);
        }

        // ---------- Modal ----------
        function openAddModal() {
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Novo Projeto';
            document.getElementById('modalSave').textContent = 'Salvar Projeto';
            form.reset();
            document.getElementById('projectId').value = '';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(function() {
                document.getElementById('projectName').focus();
            }, 150);
        }

        function openEditModal(id) {
            var project = projects.find(function(p) { return p.id === id; });
            if (!project) return;
            editingId = id;
            document.getElementById('modalTitle').textContent = 'Editar Projeto';
            document.getElementById('modalSave').textContent = 'Salvar Alterações';
            document.getElementById('projectId').value = id;
            document.getElementById('projectName').value = project.name || '';
            document.getElementById('projectUrl').value = project.url || '';
            document.getElementById('projectCategory').value = project.category || 'Landing Page';
            document.getElementById('projectStatus').value = project.status || 'planned';
            document.getElementById('projectTech').value = (project.tech || []).join(', ');
            document.getElementById('projectDesc').value = project.desc || '';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            editingId = null;
        }

        // ---------- CRUD ----------
        function handleSubmit(e) {
            e.preventDefault();
            var name = document.getElementById('projectName').value.trim();
            var url = document.getElementById('projectUrl').value.trim();
            if (!name || !url) return;

            var techRaw = document.getElementById('projectTech').value;
            var tech = techRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean);

            var data = {
                name: name,
                url: url,
                category: document.getElementById('projectCategory').value,
                status: document.getElementById('projectStatus').value,
                tech: tech,
                desc: document.getElementById('projectDesc').value.trim()
            };

            if (editingId) {
                var idx = projects.findIndex(function(p) { return p.id === editingId; });
                if (idx !== -1) {
                    projects[idx] = Object.assign({}, projects[idx], data);
                }
                saveProjects();
                renderProjects();
                showToast('Projeto atualizado!');
            } else {
                var now = new Date().toISOString().slice(0, 10);
                var newProject = Object.assign({}, data, {
                    id: 'p' + Date.now(),
                    date: now,
                    color: projects.length % COVER_GRADIENTS.length
                });
                projects.unshift(newProject);
                saveProjects();
                renderProjects();
                showToast('Projeto adicionado!');
            }
            closeModal();
        }

        function deleteProject(id) {
            var project = projects.find(function(p) { return p.id === id; });
            if (!project) return;
            var ok = window.confirm('Excluir o projeto "' + project.name + '"?');
            if (!ok) return;
            projects = projects.filter(function(p) { return p.id !== id; });
            saveProjects();
            renderProjects();
            showToast('Projeto excluído.');
        }

        // ---------- Events ----------
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalCancel').addEventListener('click', closeModal);
        form.addEventListener('submit', handleSubmit);

        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeModal();
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });

        document.getElementById('searchInput').addEventListener('input', function(e) {
            searchQuery = e.target.value.trim();
            renderProjects();
        });

        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter');
                renderProjects();
            });
        });

        grid.addEventListener('click', function(e) {
            var editBtn = e.target.closest('[data-edit]');
            if (editBtn) {
                openEditModal(editBtn.getAttribute('data-edit'));
                return;
            }
            var delBtn = e.target.closest('[data-delete]');
            if (delBtn) {
                deleteProject(delBtn.getAttribute('data-delete'));
                return;
            }
            var cover = e.target.closest('[data-open]');
            if (cover) {
                var id = cover.getAttribute('data-open');
                var project = projects.find(function(p) { return p.id === id; });
                if (project && project.url && project.url !== '#') {
                    window.open(project.url, '_blank', 'noopener');
                }
            }
        });

        // ---------- Init ----------
        document.getElementById('year').textContent = new Date().getFullYear();
        renderProjects();

        // Scroll Reveal
        var revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal').forEach(function(el) {
            revealObserver.observe(el);
        });

        // Parallax suave ao rolar
        var parallaxEls = document.querySelectorAll('[data-parallax]');
        var ticking = false;

        function updateParallax() {
            ticking = false;
            var scrolled = window.pageYOffset;

            parallaxEls.forEach(function(el) {
                var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
                var baseY = parseFloat(el.getAttribute('data-parallax-y')) || 0;
                var translateY = -scrolled * speed + baseY;
                el.style.transform = 'translate3d(0, ' + translateY + 'px, 0)';
            });
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        updateParallax();
    })();