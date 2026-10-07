// pdf.js parses and draws in this worker so a big file never blocks the page. Importing the worker build starts it.
import 'pdfjs-dist/build/pdf.worker.min.mjs';
