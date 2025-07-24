import { createRequire } from 'module';
import open from 'open';

const require = createRequire(import.meta.url);
const blessed = require('blessed');
import { PostsQueryResult } from './db/queries/posts';

export interface Post {
    id: string;
    title: string;
    url: string;
    description?: string;
    publishedAt?: Date;
    createdAt: Date;
    feedName: string;
    feedUrl: string;
}

export class PostBrowserTUI {
    private screen: any;
    private postList!: any;
    private detailBox!: any;
    private helpBox!: any;
    private statusBar!: any;
    private posts: Post[];
    private currentView: 'list' | 'detail' | 'help' = 'list';
    private selectedIndex: number = 0;

    constructor(posts: Post[]) {
        this.posts = posts;
        
        // Create screen with more explicit settings
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'TS-Gator Post Browser',
            fullUnicode: true,
            dockBorders: true,
            ignoreDockContrast: true,
            autoPadding: true,
            warnings: true
        });

        this.setupUI();
        this.setupEventHandlers();
    }

    private setupUI() {
        // Main post list
        this.postList = blessed.list({
            parent: this.screen,
            label: ' Posts ',
            top: 0,
            left: 0,
            width: '100%',
            height: '90%',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'cyan'
                },
                selected: {
                    bg: 'blue',
                    fg: 'white'
                },
                item: {
                    fg: 'white'
                }
            },
            keys: true,
            vi: true,
            mouse: true,
            scrollable: true,
            alwaysScroll: true,
            scrollbar: {
                style: {
                    bg: 'yellow'
                }
            }
        });

        // Detail view (initially hidden)
        this.detailBox = blessed.box({
            parent: this.screen,
            label: ' Post Details ',
            top: 0,
            left: 0,
            width: '100%',
            height: '90%',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'cyan'
                }
            },
            hidden: true,
            scrollable: true,
            alwaysScroll: true,
            keys: true,
            vi: true,
            mouse: true,
            scrollbar: {
                style: {
                    bg: 'yellow'
                }
            }
        });

        // Help view (initially hidden)
        this.helpBox = blessed.box({
            parent: this.screen,
            label: ' Help ',
            top: 0,
            left: 0,
            width: '100%',
            height: '90%',
            border: {
                type: 'line'
            },
            style: {
                fg: 'white',
                bg: 'black',
                border: {
                    fg: 'cyan'
                }
            },
            hidden: true,
            scrollable: true,
            alwaysScroll: true,
            keys: true,
            vi: true,
            mouse: true,
            content: this.getHelpContent()
        });

        // Status bar
        this.statusBar = blessed.box({
            parent: this.screen,
            bottom: 0,
            left: 0,
            width: '100%',
            height: 3,
            style: {
                fg: 'white',
                bg: 'blue'
            },
            content: this.getStatusBarContent()
        });

        this.populatePostList();
    }

    private populatePostList() {
        const items = this.posts.map((post, index) => {
            const publishedDate = post.publishedAt 
                ? new Date(post.publishedAt).toLocaleDateString()
                : 'No date';
            
            const title = post.title.length > 80 
                ? post.title.substring(0, 77) + '...'
                : post.title;
                
            return `[${index + 1}] ${title} (${post.feedName}) - ${publishedDate}`;
        });

        this.postList.setItems(items);
        this.postList.select(0);
    }

    private setupEventHandlers() {
        // Help key handler
        this.screen.key(['h', '?'], () => {
            this.showHelpView();
        });

        // Post list handlers
        this.postList.key(['enter', 'space'], () => {
            if (this.currentView === 'list') {
                this.showDetailView();
            }
        });

        this.postList.key(['o'], () => {
            if (this.currentView === 'list') {
                this.openInBrowser();
            }
        });

        this.postList.on('select', (item: any, index: number) => {
            this.selectedIndex = index;
            this.updateStatusBar();
        });

        // Detail view handlers
        this.detailBox.key(['escape', 'backspace'], () => {
            this.showListView();
        });

        this.detailBox.key(['o'], () => {
            this.openInBrowser();
        });

        // Help view handlers
        this.helpBox.key(['escape', 'backspace'], () => {
            this.showListView();
        });

        // Focus handling
        this.screen.on('element focus', (cur: any, old: any) => {
            if (old && old.border) old.border.fg = 'cyan';
            if (cur && cur.border) cur.border.fg = 'yellow';
            this.screen.render();
        });
    }

    private showListView() {
        this.currentView = 'list';
        this.detailBox.hide();
        this.helpBox.hide();
        this.postList.show();
        this.postList.focus();
        this.updateStatusBar();
        this.screen.render();
    }

    private showDetailView() {
        if (this.posts.length === 0) return;

        this.currentView = 'detail';
        const post = this.posts[this.selectedIndex];
        
        this.detailBox.setContent(this.formatPostDetail(post));
        this.postList.hide();
        this.helpBox.hide();
        this.detailBox.show();
        this.detailBox.focus();
        this.updateStatusBar();
        this.screen.render();
    }

    private showHelpView() {
        this.currentView = 'help';
        this.postList.hide();
        this.detailBox.hide();
        this.helpBox.show();
        this.helpBox.focus();
        this.updateStatusBar();
        this.screen.render();
    }

    private formatPostDetail(post: Post): string {
        const publishedDate = post.publishedAt 
            ? new Date(post.publishedAt).toLocaleString()
            : 'No publication date';

        const createdDate = new Date(post.createdAt).toLocaleString();

        let content = `{bold}${post.title}{/bold}\n\n`;
        content += `{cyan}Feed:{/cyan} ${post.feedName}\n`;
        content += `{cyan}URL:{/cyan} ${post.url}\n`;
        content += `{cyan}Published:{/cyan} ${publishedDate}\n`;
        content += `{cyan}Added:{/cyan} ${createdDate}\n\n`;

        if (post.description) {
            content += `{cyan}Description:{/cyan}\n`;
            content += this.wrapText(post.description, 80) + '\n\n';
        }

        content += `{yellow}Press 'o' to open in browser, 'Escape' to go back{/yellow}`;

        return content;
    }

    private wrapText(text: string, width: number): string {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            if ((currentLine + word).length > width) {
                if (currentLine) {
                    lines.push(currentLine.trim());
                    currentLine = word + ' ';
                } else {
                    lines.push(word);
                }
            } else {
                currentLine += word + ' ';
            }
        }

        if (currentLine) {
            lines.push(currentLine.trim());
        }

        return lines.join('\n');
    }

    private getHelpContent(): string {
        return `{center}{bold}TS-Gator Post Browser Help{/bold}{/center}

{bold}Navigation:{/bold}
  ↑/k          - Move up
  ↓/j          - Move down
  Enter/Space  - View post details
  o            - Open post in browser
  h/?          - Show this help
  Escape/q     - Go back / Quit

{bold}Views:{/bold}
  List View    - Browse all posts
  Detail View  - Read full post information
  Help View    - This help screen

{bold}In Detail View:{/bold}
  ↑/↓          - Scroll content
  o            - Open in browser
  Escape       - Return to list

{bold}Mouse Support:{/bold}
  Click        - Select post
  Double-click - View details
  Scroll       - Navigate list/content

{yellow}Press Escape to return to the post list{/yellow}`;
    }

    private getStatusBarContent(): string {
        const currentPost = this.posts[this.selectedIndex];
        if (!currentPost) return ' No posts available | q: quit, h: help';

        switch (this.currentView) {
            case 'list':
                return ` Post ${this.selectedIndex + 1}/${this.posts.length} | Enter: details, o: open, h: help, q: quit`;
            case 'detail':
                return ` Viewing: ${currentPost.title.substring(0, 50)}... | o: open, Esc: back`;
            case 'help':
                return ` Help | Esc: back to list`;
            default:
                return '';
        }
    }

    private updateStatusBar() {
        this.statusBar.setContent(this.getStatusBarContent());
        this.screen.render();
    }

    private async openInBrowser() {
        if (this.posts.length === 0) return;
        
        const post = this.posts[this.selectedIndex];
        
        // Validate URL
        if (!post.url || !this.isValidUrl(post.url)) {
            this.showError('Invalid URL for this post');
            return;
        }
        
        try {
            await open(post.url);
            this.showSuccess(`Opening: ${post.title.substring(0, 40)}...`);
        } catch (error) {
            this.showError(`Failed to open browser: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private isValidUrl(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    private showError(message: string) {
        const originalContent = this.statusBar.getContent();
        const originalBg = this.statusBar.style.bg;
        
        this.statusBar.setContent(` ERROR: ${message}`);
        this.statusBar.style.bg = 'red';
        this.screen.render();
        
        setTimeout(() => {
            this.statusBar.setContent(originalContent);
            this.statusBar.style.bg = originalBg;
            this.screen.render();
        }, 3000);
    }

    private showSuccess(message: string) {
        const originalContent = this.statusBar.getContent();
        const originalBg = this.statusBar.style.bg;
        
        this.statusBar.setContent(` ${message}`);
        this.statusBar.style.bg = 'green';
        this.screen.render();
        
        setTimeout(() => {
            this.statusBar.setContent(originalContent);
            this.statusBar.style.bg = originalBg;
            this.screen.render();
        }, 2000);
    }

    public async run(): Promise<void> {
        return new Promise((resolve) => {
            // Handle terminal resize
            process.stdout.on('resize', () => {
                this.screen.alloc();
                this.screen.render();
            });

            // Handle process cleanup
            const cleanup = () => {
                this.cleanup();
                resolve(undefined);
            };

            process.on('exit', cleanup);
            process.on('SIGINT', () => {
                cleanup();
                process.exit(0);
            });

            // Exit handler that handles cleanup properly
            this.screen.key(['escape', 'q', 'C-c'], () => {
                if (this.currentView === 'list') {
                    cleanup();
                    process.exit(0);
                } else {
                    this.showListView();
                }
            });

            if (this.posts.length === 0) {
                this.statusBar.setContent(' No posts found! Press q to quit');
                this.screen.render();
                return;
            }

            this.postList.focus();
            this.screen.render();
        });
    }

    private cleanup() {
        try {
            this.screen.destroy();
        } catch (error) {
            // Ignore cleanup errors
        }
    }
}