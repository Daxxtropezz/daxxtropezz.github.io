var twitter = "https://twitter.com/daxxtropezz";
var linkedin = "https://www.linkedin.com/in/daxxtropezz/";
var facebook = "https://www.fb.com/daxxtropezz/";
var instagram = "https://www.instagram.com/daxxtropezz/";
var github = "https://github.com/daxxtropezz";
var sudo = "https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1";
var emailme = "mailto:miraflores.john@gmail.com";

help = [
  `<br><pre class="whitespace-pre-wrap">
  <span class="command">back</span>\t\t&nbsp;\treturns to main portfolio
  <span class="command">banner</span>\t\t&nbsp;\tdisplays the header for this terminal
  <span class="command">clear</span>\t\t&nbsp;\t\t\tclears the terminal
  <span class="command">cls</span>\t\t&nbsp;\t\t\t\tclears the terminal
  <span class="command">emailme</span>\t\t&nbsp;\tdon't try to send me an email
  <span class="command">help</span>\t\t&nbsp;\t\t\tprovides help information for commands
  <span class="command">history</span>\t\t&nbsp;\t\tviews command history
  <span class="command">projects</span>\t\t&nbsp;\tviews my projects
  <span class="command">secret</span>\t\t&nbsp;\t\topens a secret command code
  <span class="command">social</span> \t\t&nbsp;\t\tdisplays social networks
  <span class="command">whoami</span>\t\t&nbsp;\tdiplays a description of who i am
  </pre>`,
];

whoami = [
  "<br>",
  "<span>Hey, I'm Daxxtropezz!👋</span>",
  '🔭 I’m a graduate student from CvSU - Imus Campus, with a degree of <span class="command text-[#75e1e7]">Bachelor of Science in Information Technology</span>.',
  `<ul>🌱 My fields of intetests are:<li>Fullstack Development</li><li>UI/UX Designing</li></ul>`,
  `<li><pre class="whitespace-pre-wrap">👯 I would love to work with anyone who wants to build a 
   professional website for their business or even a personal 
   website to showcase their portfolio.
   I love learning new stuff and using it to improve my skills.
   You can learn more about the projects that I have built using 
   the <span class="command text-[#75e1e7]">'projects'</span> command.
   You can browse around my website to find out more about 
   me. Try using <span class="command text-[#75e1e7]">social commands</span> and/or <span class="command text-[#75e1e7]">'help'</span> to explore more.</pre>`,
  `<li>👨‍💻 You can use the <span class="command text-[#75e1e7]">'github'</span> command to take a look at my GitHub profile.`,
  `<li>📫 Contact me at <a href= "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=miraflores.john@gmail.com">miraflores.john@gmail.com</a>`,
  "<br>",
];

// prettier-ignore
social = [
    "<br><pre class='whitespace-pre-wrap'>",
    'typing them as command also opens their link in new tab:',
    'twitter&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\t\t\t\t<a href="' + twitter + '" target="blank">twitter/daxxtropezz</a>',
    'linkedin&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\t\t\t\t<a href="' + linkedin + '" target="blank">linkedin/daxxtropezz</a>',
    'facebook&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\t\t\t\t<a href="' + facebook + '" target="blank">facebook/daxxtropezz</a>',
    'instagram&nbsp;&nbsp;&nbsp;&nbsp;\t\t\t\t<a href="' + instagram + '" target="blank">instagram/daxxtropezz</a>',
    'github&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\t\t\t\t<a href="' + github + '" target="blank">github/daxxtropezz</a>',
    "</pre><br>",
];

projects = [
  `<br><pre class="whitespace-pre-wrap">
  Still curating... most projects are offline, on GitHub, or confidential.
  </pre>`,
];

banner = [
  `<pre
  class="ascii" style="font-family: monospace,-webkit-pictograph;">
  
  ░██╗░░░░░░░██╗███████╗██╗░░░░░░█████╗░░█████╗░███╗░░░███╗███████╗  ████████╗░█████╗░
  ░██║░░██╗░░██║██╔════╝██║░░░░░██╔══██╗██╔══██╗████╗░████║██╔════╝  ╚══██╔══╝██╔══██╗
  ░╚██╗████╗██╔╝█████╗░░██║░░░░░██║░░╚═╝██║░░██║██╔████╔██║█████╗░░  ░░░██║░░░██║░░██║
  ░░████╔═████║░██╔══╝░░██║░░░░░██║░░██╗██║░░██║██║╚██╔╝██║██╔══╝░░  ░░░██║░░░██║░░██║
  ░░╚██╔╝░╚██╔╝░███████╗███████╗╚█████╔╝╚█████╔╝██║░╚═╝░██║███████╗  ░░░██║░░░╚█████╔╝
  ░░░╚═╝░░░╚═╝░░╚══════╝╚══════╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚══════╝  ░░░╚═╝░░░░╚════╝░ © 2023
  ██████╗░░█████╗░██╗░░██╗██╗░░██╗██╗░░░██╗██╗░██████╗  ░██╗░░░░░░░██╗░█████╗░██████╗░██╗░░░░░██████╗░
  ██╔══██╗██╔══██╗╚██╗██╔╝╚██╗██╔╝╚██╗░██╔╝╚█║██╔════╝  ░██║░░██╗░░██║██╔══██╗██╔══██╗██║░░░░░██╔══██╗
  ██║░░██║███████║░╚███╔╝░░╚███╔╝░░╚████╔╝░░╚╝╚█████╗░  ░╚██╗████╗██╔╝██║░░██║██████╔╝██║░░░░░██║░░██║
  ██║░░██║██╔══██║░██╔██╗░░██╔██╗░░░╚██╔╝░░░░░░╚═══██╗  ░░████╔═████║░██║░░██║██╔══██╗██║░░░░░██║░░██║
  ██████╔╝██║░░██║██╔╝╚██╗██╔╝╚██╗░░░██║░░░░░░██████╔╝  ░░╚██╔╝░╚██╔╝░╚█████╔╝██║░░██║███████╗██████╔╝
  ╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░░░░╚═════╝░  ░░░╚═╝░░░╚═╝░░░╚════╝░╚═╝░░╚═╝╚══════╝╚═════╝░
  </pre>`,
  `<div class="pt-2"><span class="text-[#7d82d7db]">Welcome to my interactive web terminal! — Type <span class="command text-[#75e1e7]">'help'</span> for a list of supported commands.</span></div>`,
  `Or you can click <a onclick="history.back()" target="blank">return</a> to go back to the main portfolio.`,
  `<span class="command text-[#75e1e7]">Created by Daxxtropezz. All rights reserved.</span>`,
];
