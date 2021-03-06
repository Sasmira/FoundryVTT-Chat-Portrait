/**
 * Main class wrapper for all of our features.
 */
class PortraitsOnChatMessage {
  static onRenderChatMessage(chatMessage, html, messageData) {
    let speaker = messageData.message.speaker
    var actor = PortraitsOnChatMessage.loadActorForChatMessage(speaker);

    if (actor) {
      let img = PortraitsOnChatMessage.generatePortraitImageElement(actor);
      let authorColor = messageData.author ? messageData.author.data.color : "black";

      PortraitsOnChatMessage.setImageBorderShape(img, authorColor);

      // Place the image to left of the header by injecting the HTML
      let element = html.find(".message-header")[0];
      element.prepend(img);

      PortraitsOnChatMessage.setChatMessageBorder(html, messageData, authorColor);
    }
  }

  /**
   * Load the appropriate actor for a given message, leveraging token or actor or actor search.
   * @param {*} speaker 
   */
  static loadActorForChatMessage(speaker) {
    var actor;
    if (speaker.token) {
      actor = game.actors.tokens[speaker.token];
    }
    if (!actor) {
      actor = game.actors.get((speaker.actor));
    }
    const forceNameSearch = game.settings.get('ChatPortrait', 'forceNameSearch');
    if (!actor && forceNameSearch) {
      game.actors.forEach((value) => {
        if (value.name === speaker.alias) {
          actor = value;
        }
      });
    }
    return actor;
  }

  static generatePortraitImageElement(actor) {
    let img = document.createElement("img");
    if (game.settings.get('ChatPortrait', 'tokenImage')) {
      img.src = actor.token ? actor.token.data.img : actor.data.token.img;
    }
    else {
      img.src = actor.img;
    }
    let size = game.settings.get('ChatPortrait', 'portraitSize');
    img.width = size;
    img.height = size;
    return img;
  }

  static setImageBorderShape(img, authorColor) {
    const borderShape = game.settings.get('ChatPortrait', 'borderShape');
    switch (borderShape) {
      case 'square':
        img.style.border = `2px solid ${authorColor}`;
        break;
      case 'circle':
        img.style.border = `2px solid ${authorColor}`;
        img.style.borderRadius = "50%";
        break;
      case 'none':
        img.style.border = "none";
        break;
    }
  }

  /**
   * Set the border color of the entire message to be the color for the author.
   * Only do so if
   *  - chatBorderColor setting is true AND
   *  - someone further up the chain hasn't already changed the color
   * @param {*} html 
   * @param {*} messageData 
   * @param {*} authorColor 
   */
  static setChatMessageBorder(html, messageData, authorColor) {
    const chatborderColor = game.settings.get('ChatPortrait', 'chatBorderColor');

    // nly override the border color if someone further up the chain hasn't already done so.
    if(chatborderColor && !messageData.borderColor) {
      html[0].style.borderColor = authorColor;
      messageData.borderColor = authorColor;
    }
  }
}

/**
 * These hooks register the following settings in the module settings.
 */
Hooks.once('init', () => {
  game.settings.register('ChatPortrait', 'portraitSize', {
    name: "chat-portrait.portrait-size-s",
    hint: "chat-portrait.portrait-size-l",
    scope: "world",
    config: true,
    default: 36,
    type: Number,
    onChange: x => window.location.reload()
  });

  game.settings.register('ChatPortrait', 'borderShape', {
    name: "chat-portrait.border-shape-s",
    hint: "chat-portrait.border-shape-l",
    scope: "world",
    config: true,
    default: "square",
    choices: {
      "square": "chat-portrait.square",
      "circle": "chat-portrait.circle",
      "none": "chat-portrait.none"
    },
    type: String,
    onChange: x => window.location.reload()
  });

  game.settings.register('ChatPortrait', 'chatBorderColor', {
    name: "chat-portrait.border-color-s",
    hint: "chat-portrait.border-color-l",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });

  game.settings.register('ChatPortrait', 'tokenImage', {
    name: "chat-portrait.token-image-s",
    hint: "chat-portrait.token-image-l",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });

  game.settings.register('ChatPortrait', 'forceNameSearch', {
    name: "chat-portrait.force-name-search-s",
    hint: "chat-portrait.force-name-search-l",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });
});

/**
 * This line connects our method above with the chat rendering.
 * Note that this happens after the core code has already generated HTML.
 */
Hooks.on('renderChatMessage', PortraitsOnChatMessage.onRenderChatMessage);
