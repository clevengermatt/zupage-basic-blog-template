import React, { Component } from "react";
import "./App.css";
import zupage from "zupage";
import { Container, Image } from "semantic-ui-react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css"; // This only needs to be imported once in your app

class App extends Component {
  state = {
    author: {},
    colorPalette: [],
    images: [],
    paragraphs: [],
    title: "",
    lightboxIndex: 0,
    lightboxIsOpen: false
  };

  async componentDidMount() {
    const postResponse = await zupage.getCurrentPost();
    this.setState({
      author: postResponse.creator,
      colorPalette: postResponse.page.color_palette,
      images: postResponse.images,
      paragraphs: this.paragraphs(postResponse),
      title: postResponse.title
    });
  }

  paragraphs = post => {
    if (post.body) {
      var body = post.body;
      body = body.substr(post.title.length, body.length);
      body = body.trim();
      return body.match(/[^\r\n]+/g);
    }
    return [];
  };

  renderHeader = () => {
    const { images } = this.state;

    let topImage = "";
    if (images.length > 0) {
      topImage = images[0].url;
    }

    return (
      <Image
        src={topImage}
        className="Title-Image"
        onClick={() =>
          this.setState({
            lightboxIsOpen: true,
            lightboxIndex: 0
          })
        }
        centered
      />
    );
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
        const lightboxIndex = imageIndex;
        return (
          <p key={i}>
            <Image
              key={images[imageIndex].id}
              src={images[imageIndex].url}
              className="Inline-Image"
              onClick={() =>
                this.setState({
                  lightboxIsOpen: true,
                  lightboxIndex: lightboxIndex
                })
              }
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
      const lightboxIndex = i + 1;
      return (
        <Image
          key={image.id}
          src={image.url}
          onClick={() =>
            this.setState({
              lightboxIsOpen: true,
              lightboxIndex: lightboxIndex
            })
          }
        />
      );
    });
  };

  render() {
    const {
      colorPalette,
      images,
      lightboxIndex,
      lightboxIsOpen,
      title
    } = this.state;

    return (
      <div
        className="Template"
        style={{
          backgroundImage: `linear-gradient(to right, #${colorPalette[2]}, #${
            colorPalette[3]
          })`
        }}
      >
        {this.renderHeader()}
        <div className="Sub-Image">
          <Container text>
            <div className="Title-Text">
              <p>{title}</p>
              {this.renderAuthor()}
            </div>
            <div className="Body-Text">{this.renderParagraphs()}</div>
          </Container>
        </div>

        {lightboxIsOpen && (
          <Lightbox
            imageCaption={images[lightboxIndex].caption}
            mainSrc={images[lightboxIndex].url}
            nextSrc={images[(lightboxIndex + 1) % images.length].url}
            prevSrc={
              images[(lightboxIndex + images.length - 1) % images.length].url
            }
            onCloseRequest={() => this.setState({ lightboxIsOpen: false })}
            onMovePrevRequest={() =>
              this.setState({
                lightboxIndex:
                  (lightboxIndex + images.length - 1) % images.length
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                lightboxIndex: (lightboxIndex + 1) % images.length
              })
            }
          />
        )}
      </div>
    );
  }
}

export default App;
