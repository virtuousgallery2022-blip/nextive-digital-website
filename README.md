# Nextive Digital Website

This directory contains the complete source code for the stunning, responsive Nextive Digital website. 

## Features
- **Premium Aesthetics**: Glassmorphism, tailored gradients, and smooth scroll animations.
- **Pages**: Home, About, Services, and Contact.
- **Form Handling**: Contact form is pre-configured with `data-netlify="true"` so Netlify will capture submissions instantly.

## How to Add Your Provided Logos
Because I didn't extract the direct raw files from the prompt attachment, you can simply do the following:
1. Create a folder here named `assets` if it doesn't exist, and an `images` folder inside it.
2. Drop your Nextive, 22 Gen, and Virtuous Gallery logos inside `assets/images/`.
3. Open `index.html` and replace the placeholder `<i class="fa-solid ..."></i>` inside the `.brand-icon` divs with `<img src="./assets/images/your-logo-name.png" alt="Brand Logo">`.
4. E.g., for Virtuous Gallery, find the `<!-- Replace with <img... -->` comment and uncomment/update it.

## Netlify Deploy Instructions
Deploying this static site to Netlify is incredibly easy and entirely free:

1. Create a free account on [Netlify](https://www.netlify.com/).
2. On your Netlify team dashboard, drag and drop the entire `nextive-digital` folder where it says "Drag and drop your site output folder here".
3. Netlify will instantly upload the files, parse the `netlify.toml`, and deploy your live site!
4. The contact form on `contact.html` will automatically work and forward messages to your Netlify dashboard under the "Forms" tab.

Feel free to customize further or launch!
