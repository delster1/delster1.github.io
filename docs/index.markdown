---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: d3's webite
---
This site is currently under maintenance. To see some more completed (and in progress) projects, check out my github repositories here! [my repo][d3-repos]
here's my rust anthill project while we wait!
<div id="food-count"></div>
<button id="reset">Reset Universe</button>
<canvas id="anthill-canvas"></canvas>

<script type='module'>
	import { run } from "/src/anthill/anthill_web.js" 
	run()
</script>

[d3-repos]: https://github.com/delster1


