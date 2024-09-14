Experimental babel plugin to minify tailwind classes in the html sent to the browser

it will search for react components classNames and group every similar classes together

for example:

1- component 1 has  `className="px-1 py-2 mx-1 my-2"`

2- component 2 has `className="px-1 py-2"`

3- component 3 has  `className="py-2 my-2 mx-1 px-1 bg-red-500 text-white"`


The plugin should at build time recognise the similarities of these classNames, and generate random classes that includes these classes:

```scss
@layer components{
  .group-1 {
    @apply px-1 py-2
  }
}
@layer components{
  .group-2 {
    @apply mx-1 my-2
  }
}
@layer components{
  .group-3 {
    @apply bg-red-500 text-white
  }
}
```
And the react components will transform to:

1- className="group-2 group-2"

2- className="group-1"

3- className="group-1 group-2 group-3"


This will reduce the size of components response sent from the server, but it might increase the size of the overall css files, needs more testing to figure out the viability of the plugin


*TODO:*


- [ ] Use layer @apply instead of just apply( we use apply only because it is getting purged, since tailwind is ran before babel plugin is ran, tailwind is not ran on transformed files)
- [ ] Figure out a way to make Babel’s run before tailwinds and make tailwinds scan transformed files(in nextjs)
- [ ] Validate classnames before transforming
- [ ] Run on html files?
