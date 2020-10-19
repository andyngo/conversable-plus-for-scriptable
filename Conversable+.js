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
    SHOW_BG: true,
    IMAGE_PATH: "bg.png",
  },
  BG_OVERLAY: {
    SHOW_OVERLAY: true,
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

let contacts = [];

if (SETTINGS.RANDOMIZE_CONTACTS == true) {
  contacts = [...contacts_list]
    .sort(() => 0.5 - Math.random())
    .slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
} else {
  contacts = [...contacts_list].slice(0, SETTINGS.NO_OF_CONTACTS_TO_SHOW);
}

const PHONE_ACTIONS = ["sms", "facetime", "facetime-audio", "call", "whatsapp"];

async function CreateAction(contact) {
  let alert = new Alert();
  alert.title = `Start a conversation with ${contact.name}`;

  let { phone, email, twitter_id, telegram } = contact;

  let displayName;
  let actions = [];

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

  alert.addCancelAction("Dismiss");

  let selected = await alert.presentSheet();

  if (selected != -1) {
    Safari.open(actions[selected].actionUrl);
  }

  return actions;
}

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

let scriptName = encodeURIComponent(Script.name());

async function CreateContact(contact, idx, row) {
  let { PHOTO_SIZE, NAME_FONT_SIZE } = SETTINGS;

  let contactStack = row.addStack();
  contactStack.layoutVertically();

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

  if (BG_IMAGE.SHOW_BG == true) {
    let bg = await getImg(BG_IMAGE.IMAGE_PATH);
    w.backgroundImage = bg;
  }

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

  w.setPadding(PADDING, PADDING, PADDING, PADDING);

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

let idx = args.queryParameters.index;

if (config.runsInApp && idx != -1) {
  CreateAction(contacts[idx]);

  Script.complete();
}

if (config.runsInApp && idx == null) {
  let w = await CreateWidget(contacts);
  w.presentMedium();
  Script.complete();
}

if (config.runsInWidget) {
  CreateWidget(contacts);
  Script.complete();
}
