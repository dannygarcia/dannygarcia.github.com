import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import markdown from 'vite-plugin-md';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import markdownIt from 'markdown-it';

export default defineConfig({
    plugins: [
        glsl(),
        viteStaticCopy({
            targets: [
                { src: 'src/worker-physics.js', dest: 'src' },
                { src: 'src/libs/cannon.build.js', dest: 'src/libs'}
            ]
        }),
        markdown({
            mode: 'html',
            markdownIt: {
                html: true,
                linkify: true,
                typographer: true,
            },
            markdownItSetup(md) {
                md.renderer.rules.table_open = function() {
                    return '<table class="table">';
                };
            },
            markdownItOptions: {
                html: true,
                linkify: true,
                typographer: true,
            },
            markdownItUses: [
                require('markdown-it-toc-done-right')
            ],
            transforms: {
                before: (content) => {
                    return content;
                },
                after: (content) => {
                    return content;
                }
            }
        }),
        createHtmlPlugin({
            pages: generateHtmlPages()
        })
    ],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            fs: 'empty-module',
        },
    },
    server: {
        host: 'localhost',
        port: 3000,
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'main.built.js',
            }
        }
    }
});

function generateHtmlPages() {
    const notesDir = path.resolve(__dirname, 'src/notes');
    const template = fs.readFileSync(path.resolve(notesDir, 'template.html'), 'utf-8');
    const files = fs.readdirSync(notesDir);
    const md = markdownIt({
        html: true,
        linkify: true,
        typographer: true,
    });

    return files
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const filePath = path.resolve(notesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const { data, content: mdContent } = matter(content);
            const htmlContent = md.render(mdContent);
            const date = file.split('-').slice(0, 3).join('-');
            const title = data.title || 'Untitled';
            const description = data.description || '';
            const url = `/notes/${file.replace('.md', '.html')}`;

            const html = template
                .replace('{{ title }}', title)
                .replace('{{ description }}', description)
                .replace('{{ url }}', url)
                .replace('{{{ content }}}', htmlContent);

            return {
                filename: `notes/${file.replace('.md', '.html')}`,
                templateContent: () => html,
            };
        });
}
