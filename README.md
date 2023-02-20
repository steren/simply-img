# Simply use `<img>`

When was the last time you had to worry about HTTP request / response compression? Probably never.
That's because your browser [does all of that for you](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding):

1. On every request, your browser tells the server which compression it supports by sending an `Accept-Encoding` header.
2. The server responds with the content compressed with best the algorithm that the browser supports.

Why not do the same for image formats? 

Instead we have to do things like this for images:

```html
<picture>
  <source srcset="my-cat.webp" type="image/webp">
  <source srcset="my-cat.jpg" type="image/jpeg">
  <img src="my-cat.jpg" alt="A picture of my cat">
</picture>
```

(and that's without even considering `1x` and `2x` images)

This complexity pushed onto developers leads them to either have to thing very hard about images or to use an image library (like [next/image](https://nextjs.org/docs/api-reference/next/image)).

Why not simply do this instead?

```html
<img src="my-cat" alt="A picture of my cat">
```

The browser should tell the server all it needs to know to decide which image is best to return:

- [x] which image formats it supports
- [ ] which screen density is used (1x, 2x, etc.)
- [ ] which size the image will be rendered (if known)
- [ ] if the user is on a slow connection
- [ ] if dark mode is used
- [ ] ...

This is called [content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation).

This repository explores an implementation of that.

## Read more:

* [Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding)
* [Content negotiation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation)
* [`Accept` Values that browsers send for images](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation/List_of_default_Accept_values#values_for_an_image)
* [HTTP Client Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Client_hints) as a way to extend `Accept-*`
