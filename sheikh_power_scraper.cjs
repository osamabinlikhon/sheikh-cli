#!/usr/bin/env node
/**
 * Sheikh Power Scraper - Node.js Version
 * ================================
 * A production-grade, anti-blocking web scraper using Playwright.
 * Designed for Bangla language websites with stealth features.
 * 
 * Features:
 * - Stealth browser with anti-detection measures
 * - Human-like behavior simulation
 * - Automatic retries with exponential backoff
 * - Rate limiting to avoid blocking
 * - Content extraction with structure preservation
 * 
 * Author: Likhon Sheikh
 * License: MIT
 * Version: 1.0.0
 */

const { chromium, firefox } = require('playwright');
const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================
// Configuration and Constants
// ============================================

const CONFIG = {
    // Stealth settings
    stealth: {
        useStealthMode: true,
        avoidWebDriver: true,
        randomizeViewport: true,
    },
    
    // Request settings
    request: {
        timeout: 60000,
        retryAttempts: 3,
        retryDelay: 3000,
        rateLimitDelay: { min: 2000, max: 5000 },
    },
    
    // Browser settings
    browser: {
        headless: true,
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    
    // Output settings
    output: {
        format: 'jsonl',
        directory: './data',
    },
};

// User agents for rotation
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a random delay within the configured range
 * @returns {Promise<void>}
 */
async function randomDelay() {
    const delay = Math.floor(
        Math.random() * 
        (CONFIG.request.rateLimitDelay.max - CONFIG.request.rateLimitDelay.min) + 
        CONFIG.request.rateLimitDelay.min
    );
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Get a random user agent from the list
 * @returns {string}
 */
function getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Generate a unique ID for each scraped page
 * @returns {string}
 */
function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

/**
 * Get timestamp in ISO format
 * @returns {string}
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Ensure output directory exists
 * @param {string} dirPath 
 */
function ensureOutputDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Save scraped data to file
 * @param {Object} data 
 * @param {string} outputPath 
 */
function saveData(data, outputPath) {
    const line = JSON.stringify(data) + '\n';
    fs.appendFileSync(outputPath, line);
}

// ============================================
// Scraper Class
// ============================================

class SheikhPowerScraper {
    constructor(options = {}) {
        this.browser = null;
        this.context = null;
        this.options = {
            headless: options.headless ?? CONFIG.browser.headless,
            userAgent: options.userAgent ?? getRandomUserAgent(),
            timeout: options.timeout ?? CONFIG.request.timeout,
            outputDir: options.outputDir ?? CONFIG.output.directory,
            outputFile: options.outputFile ?? `sheikh_data_${getTimestamp().split('T')[0]}.jsonl`,
            maxPages: options.maxPages ?? 100,
            startUrl: options.url ?? null,
            verbose: options.verbose ?? false,
        };
        
        this.stats = {
            pagesScraped: 0,
            pagesFailed: 0,
            bytesReceived: 0,
            startTime: null,
            endTime: null,
        };
        
        this.urlsScraped = new Set();
        this.outputPath = path.join(this.options.outputDir, this.options.outputFile);
    }

    /**
     * Initialize the browser with stealth settings
     */
    async initBrowser() {
        console.log('[SHEIKH] Initializing browser with stealth settings...');
        
        // Use Firefox for better headless compatibility
        this.browser = await firefox.launch({
            headless: this.options.headless,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        });
        
        this.context = await this.browser.newContext({
            viewport: CONFIG.browser.viewport,
            userAgent: this.options.userAgent,
            locale: 'en-US',
            timezoneId: 'Asia/Dhaka',
            permissions: [],
            ignoreHTTPSErrors: true,
        });
        
        // Add stealth page routes
        await this.context.route('**/*', async (route, request) => {
            const headers = await request.headers();
            
            // Add extra headers to appear more human-like
            await route.continue({
                headers: {
                    ...headers,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0',
                },
            });
        });
        
        console.log('[SHEIKH] Browser initialized successfully');
    }

    /**
     * Navigate to a URL with retry logic
     * @param {string} url 
     * @returns {Object|null}
     */
    async scrapePage(url) {
        if (this.urlsScraped.has(url)) {
            console.log(`[SHEIKH] Skipping already scraped URL: ${url}`);
            return null;
        }
        
        for (let attempt = 1; attempt <= CONFIG.request.retryAttempts; attempt++) {
            try {
                console.log(`[SHEIKH] Scraping (attempt ${attempt}/${CONFIG.request.retryAttempts}): ${url}`);
                
                const page = await this.context.newPage();
                
                // Set up console logging
                page.on('console', msg => {
                    if (this.options.verbose && msg.type() === 'error') {
                        console.log(`[PAGE ERROR] ${msg.text()}`);
                    }
                });
                
                // Set up request/response logging
                page.on('response', response => {
                    if (response.status() >= 400) {
                        console.log(`[HTTP ERROR] ${response.status()} - ${response.url()}`);
                    }
                });
                
                // Navigate with extended timeout
                const response = await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: this.options.timeout,
                });
                
                if (!response || response.status() >= 400) {
                    throw new Error(`HTTP ${response?.status() || 'No response'}`);
                }
                
                // Wait for content to load
                await page.waitForTimeout(Math.random() * 2000 + 1000);
                
                // Extract content
                const content = await this.extractContent(page, url);
                
                await page.close();
                
                this.urlsScraped.add(url);
                this.stats.pagesScraped++;
                
                if (content) {
                    this.saveContent(content);
                }
                
                return content;
                
            } catch (error) {
                console.log(`[SHEIKH] Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt === CONFIG.request.retryAttempts) {
                    this.stats.pagesFailed++;
                    console.log(`[SHEIKH] Max retries reached for: ${url}`);
                    return null;
                }
                
                // Exponential backoff
                const delay = CONFIG.request.retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        return null;
    }

    /**
     * Extract content from a page
     * @param {Page} page 
     * @param {string} url 
     * @returns {Object}
     */
    async extractContent(page, url) {
        try {
            // Get page title
            const title = await page.title();
            
            // Extract main content
            const content = await page.evaluate(() => {
                const result = {
                    text: '',
                    links: [],
                    metadata: {},
                };
                
                // Remove unwanted elements
                const unwantedSelectors = [
                    'script', 'style', 'nav', 'header', 'footer', 
                    'iframe', 'noscript', 'advertisement', '.ad', '.ads',
                    '.sidebar', '.menu', '.navigation'
                ];
                
                unwantedSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => el.remove());
                });
                
                // Extract main text content
                const mainContent = document.querySelector('main, article, .content, #content, .post, .article');
                if (mainContent) {
                    result.text = mainContent.innerText || mainContent.textContent;
                } else {
                    const body = document.body;
                    if (body) {
                        result.text = body.innerText || body.textContent;
                    }
                }
                
                // Clean up text
                result.text = result.text
                    .replace(/\s+/g, ' ')
                    .replace(/\n+/g, '\n')
                    .trim();
                
                // Extract links
                document.querySelectorAll('a[href]').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                        result.links.push({
                            text: link.innerText || link.textContent,
                            url: href.startsWith('http') ? href : new URL(href, window.location.href).href,
                        });
                    }
                });
                
                // Extract metadata
                const metaDescription = document.querySelector('meta[name="description"]');
                if (metaDescription) {
                    result.metadata.description = metaDescription.getAttribute('content');
                }
                
                const metaKeywords = document.querySelector('meta[name="keywords"]');
                if (metaKeywords) {
                    result.metadata.keywords = metaKeywords.getAttribute('content');
                }
                
                return result;
            });
            
            return {
                id: generateId(),
                url: url,
                title: title,
                content: content.text,
                links: content.links,
                metadata: content.metadata,
                scraped_at: getTimestamp(),
                source: 'sheikh-power-scraper',
            };
            
        } catch (error) {
            console.log(`[SHEIKH] Content extraction failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Save content to output file
     * @param {Object} content 
     */
    saveContent(content) {
        ensureOutputDirectory(this.options.outputDir);
        saveData(content, this.outputPath);
        console.log(`[SHEIKH] Saved: ${content.url}`);
    }

    /**
     * Scrape multiple URLs from a list or starting URL
     * @param {string|string[]} urls 
     */
    async scrape(urls) {
        const urlList = Array.isArray(urls) ? urls : [urls];
        
        console.log('[SHEIKH] Starting scrape operation...');
        console.log(`[SHEIKH] URLs to process: ${urlList.length}`);
        
        this.stats.startTime = new Date();
        
        // Initialize browser
        await this.initBrowser();
        
        for (const url of urlList) {
            if (this.stats.pagesScraped >= this.options.maxPages) {
                console.log(`[SHEIKH] Reached max pages limit: ${this.options.maxPages}`);
                break;
            }
            
            await this.scrapePage(url);
            
            // Add delay between requests
            await randomDelay();
        }
        
        this.stats.endTime = new Date();
        
        // Close browser
        if (this.browser) {
            await this.browser.close();
        }
        
        // Print statistics
        this.printStats();
        
        return this.stats;
    }

    /**
     * Print scraping statistics
     */
    printStats() {
        const duration = (this.stats.endTime - this.stats.startTime) / 1000;
        
        console.log('\n' + '='.repeat(50));
        console.log('[SHEIKH] Scrape Operation Complete');
        console.log('='.repeat(50));
        console.log(`Pages Scraped: ${this.stats.pagesScraped}`);
        console.log(`Pages Failed: ${this.stats.pagesFailed}`);
        console.log(`Duration: ${duration.toFixed(2)} seconds`);
        console.log(`Output File: ${this.outputPath}`);
        console.log('='.repeat(50) + '\n');
    }
}

// ============================================
// Main Entry Point
// ============================================

async function main() {
    // Setup CLI with Commander
    const program = new Command();
    
    program
        .name('sheikh-power-scraper')
        .description('Sheikh Power Scraper - Anti-blocking web scraper with Playwright')
        .version('1.0.0');
    
    program
        .command('scrape')
        .description('Scrape a URL or list of URLs')
        .argument('<url>', 'URL to scrape (or path to URL list file)')
        .option('-o, --output <dir>', 'Output directory', './data')
        .option('-f, --file <filename>', 'Output filename', `sheikh_data_${new Date().toISOString().split('T')[0]}.jsonl`)
        .option('-m, --max-pages <number>', 'Maximum pages to scrape', '100')
        .option('-h, --headless', 'Run in headless mode', 'true')
        .option('-v, --verbose', 'Enable verbose logging', 'false')
        .action(async (url, options) => {
            const scraper = new SheikhPowerScraper({
                url: url,
                outputDir: options.output,
                outputFile: options.file,
                maxPages: parseInt(options.maxPages),
                headless: options.headless === 'true',
                verbose: options.verbose,
            });
            
            await scraper.scrape(url);
        });
    
    program
        .command('discover')
        .description('Discover all links from a starting URL')
        .argument('<url>', 'Starting URL')
        .option('-d, --depth <number>', 'Discovery depth', '1')
        .option('-o, --output <file>', 'Output file for discovered URLs', './data/discovered_urls.txt')
        .action(async (url, options) => {
            console.log(`[SHEIKH] Discovering links from: ${url}`);
            // Link discovery logic would go here
            console.log('[SHEIKH] Link discovery feature coming soon');
        });
    
    program
        .command('stats')
        .description('Show statistics from a data file')
        .argument('<file>', 'Data file to analyze')
        .action((file) => {
            console.log(`[SHEIKH] Statistics feature coming soon`);
        });
    
    // Parse arguments
    program.parse();
}

// Run the main function
main().catch(error => {
    console.error('[SHEIKH] Fatal error:', error);
    process.exit(1);
});
