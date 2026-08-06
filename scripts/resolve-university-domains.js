#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const TIMEOUT = 4000;

const offersPath = path.join(__dirname, '..', 'src', 'data', 'yok-offers.json');
const outPath = path.join(__dirname, '..', 'src', 'data', 'university-domains-auto.json');

function normalizeName(name) {
  return name
    .replace(/\s*\([^)]*\)$/, '')
    .replace(/üniversitesi?/i, '')
    .replace(/yüksekokulu?/i, '')
    .replace(/fakültesi?/i, '')
    .replace(/üniversite/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '');
}

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, { method: 'HEAD', timeout: TIMEOUT }, (res) => {
        const ok = res.statusCode && res.statusCode < 400;
        res.resume();
        resolve(ok);
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

async function findDomainFor(name) {
  const cleaned = normalizeName(name);
  const slug = slugify(cleaned);
  if (!slug) return null;

  const candidates = [
    `https://www.${slug}.edu.tr/`,
    `https://${slug}.edu.tr/`,
    `https://www.${slug}.edu/`,
    `https://${slug}.edu/`,
    `https://www.${slug}.ac.tr/`,
    `https://${slug}.ac.tr/`,
    `https://www.${slug}.org.tr/`,
    `https://${slug}.org.tr/`,
    `https://www.${slug}.com/`,
    `https://${slug}.com/`,
  ];

  for (const url of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkUrl(url);
    if (ok) return url;
  }
  return null;
}

async function main() {
  const raw = fs.readFileSync(offersPath, 'utf8');
  const data = JSON.parse(raw);
  const names = [...new Set(data.offers.map((o) => o.university))];

  const result = {};
  for (const name of names) {
    const cleaned = normalizeName(name);
    process.stdout.write(`Checking: ${cleaned} ... `);
    // eslint-disable-next-line no-await-in-loop
    const domain = await findDomainFor(cleaned);
    if (domain) {
      console.log(`FOUND -> ${domain}`);
      result[cleaned] = domain;
    } else {
      console.log('NOT FOUND');
      result[cleaned] = null;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('\nWrote mapping to', outPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
