// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: certificate;
// Replace the contacts array with your own.
let contacts_list = [
  {
    name: "Name 1",
    birthday: "12/10/20",
    photo: "1.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
  {
    name: "Name 2",
    photo: "2.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
  {
    name: "Name 3",
    photo: "3.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
  {
    name: "Name 4",
    photo: "4.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
  {
    name: "Name 5",
    photo: "5.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
  {
    name: "Name 6",
    photo: "6.png",
    phone: "+0123456789",
    email: "hey@email.com",
    twitter_id: "11009532",
  },
];

const SETTINGS = {
  BG_COLOR: "#151515",
  BG_IMAGE: {
    SHOW_BG: false,
    IMAGE_PATH: "bg.png",
  },
  BG_OVERLAY: {
    SHOW_OVERLAY: false,
    OVERLAY_COLOR: "#111111",
    OPACITY: 0.5,
  },
  PADDING: 8,
  TITLE_FONT_SIZE: 18,
  PHOTO_SIZE: 60,
  NAME_FONT_SIZE: 11,
  RANDOMIZE_CONTACTS: false,
  NO_OF_CONTACTS_TO_SHOW: 4,
};

// initialize contacts
let contacts = [];

// check if RANDOMIZE_CONTACTS is enabled. If it's set to `true`, randomize the contacts_list array.
if (SETTINGS.RANDOMIZE_CONTACTS == true) {
  contacts = [...contacts_list]
    .sort(() => 0.5 - Math.random())
    .slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
} else {
  contacts = [...contacts_list].slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
}

// A list of all possible actions that can be created using a contact's provided phone number. Feel free to remove any services that you don't need.
const PHONE_ACTIONS = ["sms", "facetime", "facetime-audio", "call", "whatsapp"];

// A function for creating actions that you see in the Alert Sheet.
async function CreateAction(contact) {
  let alert = new Alert();
  alert.title = `Start a conversation with ${contact.name}`;

  let { phone, email, twitter_id, telegram } = contact;

  // initialize displayName
  let displayName;

  // initialize actions
  let actions = [];

  // Conditionally create an action based on its action type.
  // Objects will be added to the actions array conditionally. This is required to determine which action index is selected and to open the appropriate URL.
  // displayName controls the name of the action that you see in the Alert Sheet.
  // actionUrl controls which URL to be opened when interacting with the Alert Sheet.
  // This section of the code is extremely repetitive. If anyone is keen to improve it without introducing too much abstraction, please open a Pull Request in the repo.
  if (phone) {
    PHONE_ACTIONS.map((action) => {
      if (action == "sms") {
        displayName = "iMessage";
        actions.push({
          displayName,
          actionUrl: `sms://${phone}`,
        });
      }
      if (action == "facetime") {
        displayName = "FaceTime";
        actions.push({
          displayName,
          actionUrl: `facetime://${phone}`,
        });
      }
      if (action == "facetime-audio") {
        displayName = "FaceTime Audio";
        actions.push({
          displayName,
          actionUrl: `facetime-audio://${phone}`,
        });
      }
      if (action == "call") {
        displayName = "Cellular Call";
        actions.push({
          displayName,
          actionUrl: `tel://${phone}`,
        });
      }
      if (action == "whatsapp") {
        displayName = "WhatsApp";
        actions.push({
          displayName,
          actionUrl: `whatsapp://send?text=&phone=${phone}`,
        });
      }
      alert.addAction(displayName);
    });
  }
  if (email) {
    displayName = "Email";
    actions.push({
      displayName,
      actionUrl: `mailto:${email}`,
    });
    alert.addAction(displayName);
  }
  if (telegram) {
    displayName = "Telegram";
    actions.push({
      displayName,
      actionUrl: `tg://resolve?domain=${contact.telegram}`,
    });
    alert.addAction(displayName);
  }
  if (twitter_id) {
    displayName = "Twitter DM";
    actions.push({
      displayName,
      actionUrl: `twitter://messages/compose?recipient_id=${contact.twitter_id}`,
    });
    alert.addAction(displayName);
  }

  // Add a dismiss button to the Alert Sheet.
  alert.addCancelAction("Dismiss");

  // Check if an action is selected.
  let selected = await alert.presentSheet();

  // If an action is selected, open the corresponding URL stored in the actions array.
  if (selected != -1) {
    Safari.open(actions[selected].actionUrl);
  }

  return actions;
}

// A function to download images
async function getImg(image) {
  let fm = FileManager.iCloud();
  let dir = fm.documentsDirectory();
  let path = fm.joinPath(dir + "/Conversable+", image);
  let download = await fm.downloadFileFromiCloud(path);
  let isDownloaded = await fm.isFileDownloaded(path);

  if (fm.fileExists(path)) {
    return fm.readImage(path);
  } else {
    console.log("Error: File does not exist.");
  }
}

// Get the current Script Name and encode it using encodeURIComponent.
let scriptName = encodeURIComponent(Script.name());

// A function to create contacts (to be displayed in the widget).
async function CreateContact(contact, idx, row) {
  let { PHOTO_SIZE, NAME_FONT_SIZE } = SETTINGS;

  let contactStack = row.addStack();
  contactStack.layoutVertically();

  // Determine which contact's Alert Sheet to display based on the supplied index queryParameter.
  let uri = `scriptable:///run?scriptName=${scriptName}&index=${idx}`;

  contactStack.url = uri;

  let photoStack = contactStack.addStack();

  photoStack.addSpacer();
  let img = await getImg(contact.photo);
  let photo = photoStack.addImage(img);
  photo.imageSize = new Size(PHOTO_SIZE, PHOTO_SIZE);
  photo.cornerRadius = PHOTO_SIZE / 2;
  photo.applyFillingContentMode();
  photoStack.addSpacer();

  contactStack.addSpacer(4);

  let nameStack = contactStack.addStack();

  nameStack.addSpacer();
  let name = nameStack.addText(contact.name);
  name.font = Font.mediumSystemFont(NAME_FONT_SIZE);
  name.lineLimit = 1;
  nameStack.addSpacer();
}

async function CreateWidget(contacts) {
  let { BG_COLOR, BG_IMAGE, BG_OVERLAY, PADDING, TITLE_FONT_SIZE } = SETTINGS;
  let w = new ListWidget();
  w.backgroundColor = new Color(BG_COLOR);
  w.setPadding(PADDING, PADDING, PADDING, PADDING);

  // Show background image if SHOW_BG is set to `true`.
  if (BG_IMAGE.SHOW_BG == true) {
    let bg = await getImg(BG_IMAGE.IMAGE_PATH);
    w.backgroundImage = bg;
  }

  // Show overlay if SHOW_OVERLAY is set to `true`. For light background images, it is recommended that you turn overlay on so that the contact names and text remain legible.
  if (BG_OVERLAY.SHOW_OVERLAY == true) {
    let overlayColor = new Color(
      BG_OVERLAY.OVERLAY_COLOR,
      BG_OVERLAY.OPACITY || 0.3
    );
    let gradient = new LinearGradient();
    gradient.colors = [overlayColor, overlayColor];
    gradient.locations = [0, 1];
    w.backgroundGradient = gradient;
  }

  w.addSpacer();

  let containerStack = w.addStack();
  containerStack.layoutVertically();

  let titleStack = containerStack.addStack();
  titleStack.addSpacer();
  let title = titleStack.addText("Start a conversation with");
  title.font = Font.boldRoundedSystemFont(TITLE_FONT_SIZE);
  titleStack.addSpacer();

  containerStack.addSpacer(16);

  let contactRowStack = containerStack.addStack();
  contactRowStack.centerAlignContent();

  contactRowStack.addSpacer();
  contacts.map((contact, idx) => {
    CreateContact(contact, idx, contactRowStack);
  });
  contactRowStack.addSpacer();

  w.addSpacer();

  Script.setWidget(w);

  return w;
}

// Store action index
let idx = args.queryParameters.index;

// Execute only if our script is running in app + has an action selected.
if (config.runsInApp && idx != -1) {
  CreateAction(contacts[idx]);
  Script.complete();
}

// Execute only if our script is running in app + has no action selected.
if (config.runsInApp && idx == null) {
  let w = await CreateWidget(contacts);
  w.presentMedium();
  Script.complete();
}

// Execute only if the script is running in widget mode.
if (config.runsInWidget) {
  CreateWidget(contacts);
  Script.complete();
}
