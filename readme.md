# Video Choice Engine

The Video Choice Engine (VCE) is a small javascript library for showing interactive video adventures. Adventures are described with a short and clean json structure and can have multiple branches and return points.

**VCE** is optimised for mobile devices and cross platform adventuring.

## Demo

Play an exciting adventure about finding a lost sock [here!](http://joeba.in/sock)

## Example

```javascript
vce.init([{
    video: "intro",
    choices: [
        {
            label: "Go North",
            next: {
                video: "grue-appears"
            }
        },
        {
            label: "Go South",
            next: {
                video: "treasure-chest"
            }
        }
    ]
}]);
```

## Features

### Video

Each part of your adventure is represented by a node. Nodes usually have a **video** associated with them.

```javascript
{ video: "my-video" }
```

A node with no **video** will just show the **title** and **choices**.

### Text

Nodes can also contain text: **titles** and **sub-titles**. This helps frame the video and the choices.

```javascript
{ title: "Welcome to My Adventure", sub_title: "Are you brave enough?!" }
```

Text is always shown after a video, if there is one.

### Choices

Nodes usually also contain **choices** for the player to pick their next adventure. The **choices** are an array, each entry should have a label for the button and a next node, which will be played if the player picks that choice.

```javascript
choices: [
    {
        label: "Go North",
        next: {
            video: "grue-appears"
        }
    },
    {
        label: "Go South",
        next: {
            video: "treasure-chest"
        }
    }
]
```

A node with no choices is a dead end. A node can have a **next** node if it doesn't have any **choices**, the **next** node will be played straight after the current node has finished.

### IDs

Each node can optionally contain an **id** which allows other nodes to refer to it by name. This allows the game master to create loops, or to reuse nodes in different places.

```javascript
choices: [
    {
        label: "Go North",
        next: {
            id: "lose",
            video: "grue-appears",
            title: "Game Over!"
        }
    },
    {
        label: "Go East",
        next: "lose"
    },
    {
        label: "Go West",
        next: "lose"
    },
    {
        label: "Go South",
        next: {
            video: "treasure",
            title: "You Win!"
        }
    }
]
```

## Usage

```javascript
vce.init(myGame, {el: "#container"});
```

`myGame` can be a node or an array of nodes. If it is an array the first node will be the start of your adventure. This is useful if you have some nodes with ids which are used frequently and you would like to put them outside of the tree.

### Options

The second paramater is for options. If you don't want specify any options then you can just pass the container element through as the second paramater. Otherwise an object should be passed, the following options are valid:

 * **el** - a plain or jquery wrapped element or a css style selector for an element which will contain the adventure.
 * **video_url** - you may want to host the videos at a separate url (S3 for example). You can specify a root url for the videos with this parameter.

## Dependencies

**VCE** depends on [popcorn.js](http://popcornjs.org/) and [jQuery](http://jquery.com/). You will probably also want to use [-prefix-free](http://leaverou.github.io/prefixfree/).

## Extras

### Video Transcoding

This repository also includes a ruby script `transcode.rb` which can be used to produce multiple videos at appropriate resolutions and codecs for proper multi-browser support. It uses [avconv](https://libav.org/avconv.html) although it could probably be made to work with [ffmpeg](https://www.ffmpeg.org/) quite easily (since they are mostly the same thing).

The transcode script by default produces videos in mp4 (h264 (baseline) + aac), ogg (vorbis + theora) and webm (vp8 + vorbis) formats which should cover most browsers and has been tested with Chrome, Firefox and Safari (desktop and mobile for each). IE is left as an excercise for the reader.

Each video is also transcoded into four different resolutions: 1280x720, 854x480, 428x240 and 320x180. Which should cover the full range of desktop, mobile and tablet devices. You can modify `transcode.rb` to suit your own needs.

### Styling

There is a css file (`vce-style.css`) which will provide some usable styling for the adventure. You might like to replace this with your own styles. There are not very many elements:

 * `#vce-video` - the main video player.
 * `#vce-overlay` - sits over the video and shows text and choices.
 * `#vce-title` - title text for a node.
 * `#vce-sub-title` - sub-title text for a node.
 * `#vce-choices` - the choices container.
 * `.vce-choice` - a choice button.
 * `#vce-spinner` - shown when a video is loading.
 * `#vce-error` - shown in the case of an error. Contains an error message.
 * `.vce-hidden` - applied to some elements when they should be hidden.
 * `.vce-shown` - applied to some elements when they should be shown (which are hidden by default, eg `#vce-error`)

## Licence

VCE is release under the MIT License (MIT)

Copyright (c) 2014 Joe Bain 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
