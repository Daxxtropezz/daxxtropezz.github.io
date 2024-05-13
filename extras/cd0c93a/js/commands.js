var twitter = 'https://twitter.com/daxxtropezz'
var linkedin = 'https://www.linkedin.com/in/daxxtropezz/'
var facebook = 'https://www.fb.com/daxxtropezz/'
var instagram = 'https://www.instagram.com/daxxtropezz/'
var github = 'https://github.com/daxxtropezz'
var sudo = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1'
var emailme = 'mailto:miraflores.john@gmail.com'
var password = 'daxxyishere'

help = [
  '<br>',
  '<span class="command">banner</span>            displays the header for this terminal',
  '<span class="command">clear</span>             clears the terminal',
  '<span class="command">cls</span>               clears the terminal',
  '<span class="command">emailme</span>           don\'t try to send me an email',
  '<span class="command">help</span>              provides help information for commands',
  '<span class="command">history</span>           views command history',
  '<span class="command">projects</span>          views my projects',
  '<span class="command">return</span>            returns to main portfolio',
  '<span class="command">secret</span>            opens a secret command code',
  '<span class="command">social</span>            displays social networks',
  '<span>visitors</span>          number of visitors who visited this site',
  '<span class="command">whoami</span>            diplays a description of who i am',
  '<br>',
]

secret = [
  '<br>',
  '<span class="command">sudo</span>           a secret code for ADMIN ONLY<br>',
  '<span class="command">password</span>       don\'t try it. you already broke the code!!!',
  '<br>',
]

whoami = [
  '<br>',
  "<span>Hallo, I'm Daxxtropezz!👋</span>",
  '🔭 I’m a graduate student from CvSU - Imus Campus, with a degree of <span class="command">Bachelor of Science in Information Technology</span>.',
  `<ul>🌱 My fields of intetests are:
  <li>       > Fullstack Development</li><li>       > UI/UX Designing</li></ul><pre>👯 I would love to work with anyone who wants to build a 
   professional website for their business or even a personal 
   website to showcase their portfolio.
   I love learning new stuff and using it to improve my skills.
   You can learn more about the projects that I have built using 
   the <span class="command">'projects'</span> command.
   You can browse around my website to find out more about 
   me. Try using <span class="command">social commands</span> and/or <span class="command">'help'</span> to explore more.</pre>`,
  `<li>👨‍💻 You can use the <span class="command">'github'</span> command to take a look at my GitHub profile.</li>`,
  `<li>📫 Contact me at <a href= "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=miraflores.john@gmail.com">miraflores.john@gmail.com</a></li>`,
  '<br>',
]

// prettier-ignore
social = [
    '<br>',
    '<span class="command">can be used as command:</span>',
    'twitter            <a href="' + twitter + '" target="blank">twitter/daxxtropezz</a>',
    'linkedin           <a href="' + linkedin + '" target="blank">linkedin/daxxtropezz</a>',
    'facebook           <a href="' + facebook + '" target="blank">facebook/daxxtropezz</a>',
    'instagram          <a href="' + instagram + '" target="blank">instagram/daxxtropezz</a>',
    'github             <a href="' + github + '" target="blank">github/daxxtropezz</a>',
    '<br>',
]

projects = [
  '<br>',
  'Still curating... most projects are offline, on GitHub, or confidential.',
  '<br>',
]

banner = [
  '<br>',
  '░██╗░░░░░░░██╗███████╗██╗░░░░░░█████╗░░█████╗░███╗░░░███╗███████╗  ████████╗░█████╗░',
  '░██║░░██╗░░██║██╔════╝██║░░░░░██╔══██╗██╔══██╗████╗░████║██╔════╝  ╚══██╔══╝██╔══██╗',
  '░╚██╗████╗██╔╝█████╗░░██║░░░░░██║░░╚═╝██║░░██║██╔████╔██║█████╗░░  ░░░██║░░░██║░░██║',
  '░░████╔═████║░██╔══╝░░██║░░░░░██║░░██╗██║░░██║██║╚██╔╝██║██╔══╝░░  ░░░██║░░░██║░░██║',
  '░░╚██╔╝░╚██╔╝░███████╗███████╗╚█████╔╝╚█████╔╝██║░╚═╝░██║███████╗  ░░░██║░░░╚█████╔╝',
  '░░░╚═╝░░░╚═╝░░╚══════╝╚══════╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚══════╝  ░░░╚═╝░░░░╚════╝░ © 2023',
  '██████╗░░█████╗░██╗░░██╗██╗░░██╗██╗░░░██╗██╗░██████╗  ░██╗░░░░░░░██╗░█████╗░██████╗░██╗░░░░░██████╗░',
  '██╔══██╗██╔══██╗╚██╗██╔╝╚██╗██╔╝╚██╗░██╔╝╚█║██╔════╝  ░██║░░██╗░░██║██╔══██╗██╔══██╗██║░░░░░██╔══██╗',
  '██║░░██║███████║░╚███╔╝░░╚███╔╝░░╚████╔╝░░╚╝╚█████╗░  ░╚██╗████╗██╔╝██║░░██║██████╔╝██║░░░░░██║░░██║',
  '██║░░██║██╔══██║░██╔██╗░░██╔██╗░░░╚██╔╝░░░░░░╚═══██╗  ░░████╔═████║░██║░░██║██╔══██╗██║░░░░░██║░░██║',
  '██████╔╝██║░░██║██╔╝╚██╗██╔╝╚██╗░░░██║░░░░░░██████╔╝  ░░╚██╔╝░╚██╔╝░╚█████╔╝██║░░██║███████╗██████╔╝',
  '╚═════╝░╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░░░░╚═════╝░  ░░░╚═╝░░░╚═╝░░░╚════╝░╚═╝░░╚═╝╚══════╝╚═════╝░',
  '<br>',
  'Welcome to my interactive web terminal! — Type <span class="command">\'help\'</span> for a list of supported commands.',
  'Or you can click <a onclick="history.back()" target="blank">return</a> to go back to the main portfolio.',
  '<span class="command">Created by Daxxtropezz. All rights reserved.</span>',
  '<br>',
]
