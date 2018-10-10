import React, { Component } from "react";
import "./App.css";
import zupage from "zupage";
import { Container, Image } from "semantic-ui-react";
import Linkify from "react-linkify";

class App extends Component {
  state = {
    colorPalette: [],
    currentImage: 0,
    creator: {},
    date: "",
    images: [],
    paragraphs: [],
    title: ""
  };

  async componentDidMount() {
    const postResponse = await zupage.getCurrentPost();

    const date = new Date(
      postResponse.published_time * 1000
    ).toLocaleDateString("en-US");

    this.setState({
      colorPalette: postResponse.page.color_palette,
      creator: postResponse.creator,
      date: date,
      images: this.formatImages(postResponse.images),
      paragraphs: this.paragraphs(postResponse),
      title: postResponse.title
    });
  }

  formatImages = images => {
    let photoArray = [];

    let index = 0;

    images.forEach(function(image) {
      photoArray.push({
        id: image.id,
        index: index,
        caption: image.caption,
        src: image.url,
        width: image.width,
        height: image.height
      });
      index++;
    });

    return photoArray;
  };

  paragraphs = post => {
    if (post.body) {
      var body = post.body;
      body = body.substr(post.title.length, body.length);
      body = body.trim();
      return body.match(/[^\r\n]+/g);
    }
    return [];
  };

  renderTopImage = () => {
    const { images } = this.state;

    let topImage = "";
    if (images.length > 0) {
      topImage = images[0].src;
    }

    return <Image src={topImage} className="Title-Image" centered />;
  };

  renderAuthor = () => {
    const { author } = this.state;
    return (
      <div className="Author">
        <Image className="Author-Image" src={author.profile_image_url} avatar />
        <span className="Author-Text">{author.name}</span>
      </div>
    );
  };

  renderDate = () => {
    const { date } = this.state;
    return (
      <div className="Date">
        <p>{date}</p>
      </div>
    );
  };

  renderParagraphs = () => {
    const { paragraphs, images } = this.state;

    let imageIndex = 0;

    if (!paragraphs) {
      return (
        <Image.Group size="medium">
          {this.leftoverImages(images.slice(imageIndex + 1, images.length))}
        </Image.Group>
      );
    }

    const spacing = Math.floor(paragraphs.length / images.length);

    return paragraphs.map((paragraph, i) => {
      if (i === 0) {
        const firstLetter = paragraph.charAt(0);
        const p = paragraph.substr(1, paragraph.length);
        return (
          <p key={i}>
            <span className="First-Character">{firstLetter}</span>
            {p}
          </p>
        );
      }

      if (i === paragraphs.length - 1 && imageIndex + 1 < images.length) {
        //this is the last paragraph
        // and we still have leftover images
        return (
          <div>
            <p key={i}>{paragraph}</p>
            <Image.Group size="medium">
              {this.leftoverImages(images.slice(imageIndex, images.length))}
            </Image.Group>
          </div>
        );
      }

      if (imageIndex + 1 < images.length && i % spacing === 0) {
        imageIndex++;
        return (
          <p key={i}>
            <Image
              key={images[imageIndex].id}
              src={images[imageIndex].src}
              className="Inline-Image"
              centered
            />
            {paragraph}
          </p>
        );
      }

      return <p key={i}>{paragraph}</p>;
    });
  };

  leftoverImages = images => {
    return images.map((image, i) => {
      return <Image key={image.id} src={image.url} />;
    });
  };

  renderHeader = () => {
    const { creator, date } = this.state;
    return (
      <div className="Header">
        <Image
          className="Author-Image"
          src={creator.profile_image_url}
          avatar
        />
        <span className="Author-Text">{creator.name}</span>
        <div className="Date">
          <p>{date}</p>
        </div>
      </div>
    );
  };

  render() {
    const { colorPalette, images, title } = this.state;

    return (
      <div
        className="Template"
        style={{
          backgroundImage: `linear-gradient(to right, #${colorPalette[2]}, #${
            colorPalette[3]
          })`
        }}
      >
        {this.renderTopImage()}
        <div className="Sub-Image">
          <Container text>
            <div className="Title-Text">
              {title}
              {this.renderHeader()}
            </div>
            <Linkify className="Body-Text">{this.renderParagraphs()}</Linkify>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
