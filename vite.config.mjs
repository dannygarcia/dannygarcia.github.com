import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createHtmlPlugin } from 'vite-plugin-html';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import markdownIt from 'markdown-it';
import markdownify from 'vite-plugin-markdownify';

export default defineConfig({
    plugins: [
        glsl(),
        viteStaticCopy({
            targets: [
                { src: 'src/worker-physics.js', dest: 'src' },
                { src: 'src/libs/cannon.build.js', dest: 'src/libs'}
            ]
        }),
        markdownify({
            pages: generateHtmlPages()
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
