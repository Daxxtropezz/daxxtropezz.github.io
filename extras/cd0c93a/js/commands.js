var twitter = "https://twitter.com/Daxxtropezz";
var linkedin = "https://www.linkedin.com/in/daxxtropezz/";
var instagram = "https://www.instagram.com/daxxtropezz/";
var github = "https://github.com/daxxtropezz";
var sudo = "https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1";
var email = "mailto:miraflores.john@gmail.com";

help = [
  `<br><pre class="whitespace-pre-wrap">
  <span class="command">banner</span>          &numsp;displays the header
  <span class="command">aboutme</span>      &nbsp;Diplays Who I am?
  <span class="command">social</span>       &nbsp;displays social networks
  <span class="command">projects</span>     &nbsp;View coding projects
  <span class="command">email</span>        &nbsp;To send me a email
  <span class="command">history</span>      &nbsp;View command history
  <span class="command">help</span>         &nbsp;Displays this help msg
  <span class="command">clear</span>          &numsp;clears the terminal
  </pre><br>`,
];

aboutme = [
  "<br>",
  "<span class='underline'>Hey, I'm Daxxtropezz!👋</span>",
  "<br>",
  "<li>🔭 I’m currently a 3rd year undergrad, pursuing BSc.</li>",
  "<li>🌱 My fields of intetest are</li>",
  `<pre class="whitespace-pre-wrap">
        - Fullstack Development
        - UI/UX Designing</pre>`,
  `<li><pre class="whitespace-pre-wrap">👯 I would love to work with anyone who wants to build a 
   professional website for their business or even a personal 
   website to showcase their portfolio.
   I love learning new stuff and using it to improve my skills.
   I primarily use NextJS and Tailwind CSS when building my 
   websites (projects).
   You can learn more about the projects that I have built using 
   the project command.
   You can browse around my website to find out more about 
   me.
   *Try using a social command.`,
  `<li><pre class="whitespace-pre-wrap">👨‍💻 Check out my github profile to view my projects
   *Use the github command to take a look at my GitHub profile.`,
  `<li>📫 Contact me at <a href= "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=miraflores.john@gmail.com">miraflores.john@gmail.com</a>`,
  "<br>",
];

social = [
  "<br>",
  'twitter         <a href="' +
    twitter +
    '" target="blank">twitter.com/Daxxtropezz' +
    "</a>",
  'linkedin         <a href="' +
    linkedin +
    '" target="blank">linkedin/daxxtropezz' +
    "</a>",
  'instagram         <a href="' +
    instagram +
    '" target="blank">instagram/daxxtropezz' +
    "</a>",
  'github         <a href="' +
    github +
    '" target="blank">github/daxxtropezz' +
    "</a>",
  "<br>",
];

projects = [
  "<br>",
  `<a href="https://github.com/daxxtropezz/google-clone" target="blank"><span class='underline'>Google Search Clone</span>`,
  "<br>",
  `<pre class="indent-8 whitespace-pre-wrap">A functional replica of Google's search page, you can use it for searches. Styled with Tailwind CSS to Rapidly build and look as close as possible to current google search page, the search results are pulled using Googles Programmable Search Engine and it was build using Next.js the react framework.

Project is live here <a href="https://google-clone-p8mn37r8a-daxxtropezz.vercel.app/" target="blank">https://google-clone-daxxtropezz.vercel.app/</a>
*Please do not spam searches.

Built With

    *Next.js
    *Tailwind CSS
    *Programmable Search Engine
    *Yarn
`,

  "<br>",

  `<a href="https://github.com/daxxtropezz/contactform" target="blank"><span class='underline'>Contactform With Google Sheets as Database</span>`,
  "<br>",
  `<pre class="indent-8 whitespace-pre-wrap">This contact form collects information from the user and saves it to Google Sheets using the Google cloud APIs.
After filling out the form, the user will receive a personalized email with a link to the form that says their response has been recorded. 
It was built using Next.JS, the React framework and styled with Tailwind CSS.

Project is live here <a href="https://contactform-psi.vercel.app/" target="blank">https://contactform-psi.vercel.app/</a>

Built With

    *Next.js
    *Tailwind CSS
    *Google Sheets api
    *IFTTT
    *Yarn
`,

  "<br>",
];

banner = [
  `<div class="pt-2"><span class="text-[#7d82d7db]">Welcome to my interactive web terminal! — Type <span class="command text-[#75e1e7]">help</span> for a list of supported commands.</span></div>`,
  `Or you can click <a onclick="history.back()" target="blank">return</a> to go back to the main portfolio.`,
  `<span class="command text-[#75e1e7]">Created by Daxxtropezz. All rights reserved.</span>`,
];
