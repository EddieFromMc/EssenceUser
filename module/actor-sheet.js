import { EntitySheetHelper } from "./helper.js";
import {ATTRIBUTE_TYPES} from "./constants.js";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["worldbuilding", "sheet", "actor"],
      template: "systems/essenceuser/templates/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".biography", ".items", ".attributes"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);
    context.shorthand = !!game.settings.get("worldbuilding", "macroShorthand");
    context.systemData = context.data.system;
    context.dtypes = ATTRIBUTE_TYPES;
	if (this.actor.owner) {
  let handler = ev => this._onDragStart(ev);
  // Find all items on the character sheet.
  html.find('li.item').each((i, li) => {
    // Ignore for the header row.
    if (li.classList.contains("item-header")) return;
    // Add draggable attribute and dragstart listener.
    li.setAttribute("draggable", true);
    li.addEventListener("dragstart", handler, false);
  });
}
    context.raceHTML = await TextEditor.enrichHTML(context.systemData.race, {
      secrets: this.document.isOwner,
      async: true
    });
	context.knowelegeHTML = await TextEditor.enrichHTML(context.systemData.knowelege, {
      secrets: this.document.isOwner,
      async: true
    });
	const rollData=this.actor.getRollData()
		context.effect1HTML = await TextEditor.enrichHTML(context.systemData.effect1, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect2HTML = await TextEditor.enrichHTML(context.systemData.effect2, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect3HTML = await TextEditor.enrichHTML(context.systemData.effect3, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect4HTML = await TextEditor.enrichHTML(context.systemData.effect4, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect5HTML = await TextEditor.enrichHTML(context.systemData.effect5, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect6HTML = await TextEditor.enrichHTML(context.systemData.effect6, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect7HTML = await TextEditor.enrichHTML(context.systemData.effect7, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect8HTML = await TextEditor.enrichHTML(context.systemData.effect8, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect9HTML = await TextEditor.enrichHTML(context.systemData.effect9, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect10HTML = await TextEditor.enrichHTML(context.systemData.effect10, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect11HTML = await TextEditor.enrichHTML(context.systemData.effect11, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect12HTML = await TextEditor.enrichHTML(context.systemData.effect12, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect13HTML = await TextEditor.enrichHTML(context.systemData.effect13, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect14HTML = await TextEditor.enrichHTML(context.systemData.effect14, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect15HTML = await TextEditor.enrichHTML(context.systemData.effect15, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect16HTML = await TextEditor.enrichHTML(context.systemData.effect16, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect17HTML = await TextEditor.enrichHTML(context.systemData.effect17, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect18HTML = await TextEditor.enrichHTML(context.systemData.effect18, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect19HTML = await TextEditor.enrichHTML(context.systemData.effect19, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.effect20HTML = await TextEditor.enrichHTML(context.systemData.effect20, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
	context.usernotesHTML = await TextEditor.enrichHTML(context.systemData.usernotes, {
      rollData,
          secrets: this.document.isOwner,
      async: !0
    });
    return context;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    // Item Controls
    html.find(".item-control").click(this._onItemControl.bind(this));
    html.find(".items .rollable").on("click", this._onItemRoll.bind(this));

    // Add draggable for Macro creation
    html.find(".attributes a.attribute-roll").each((i, a) => {
      a.setAttribute("draggable", true);
      a.addEventListener("dragstart", ev => {
        let dragData = ev.currentTarget.dataset;
        ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }, false);
    });
  }

  /* -------------------------------------------- */

  /**
   * Handle click events for Item control buttons within the Actor Sheet
   * @param event
   * @private
   */
  _onItemControl(event) {
    event.preventDefault();

    // Obtain event data
    const button = event.currentTarget;
    const li = button.closest(".item");
    const item = this.actor.items.get(li?.dataset.itemId);

    // Handle different actions
    switch ( button.dataset.action ) {
      case "create":
        const cls = getDocumentClass("Item");
        return cls.create({name: game.i18n.localize("SIMPLE.ItemNew"), type: "item"}, {parent: this.actor});
      case "edit":
        return item.sheet.render(true);
      case "delete":
        return item.delete();
    }
  }

  /* -------------------------------------------- */

  /**
   * Listen for roll buttons on items.
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let r = new Roll(button.data('roll'), this.actor.getRollData());
    return r.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData) {
    let formData = super._getSubmitData(updateData);
    formData = EntitySheetHelper.updateAttributes(formData, this.object);
    formData = EntitySheetHelper.updateGroups(formData, this.object);
    return formData;
  }
}
