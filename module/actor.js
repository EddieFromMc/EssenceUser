import { EntitySheetHelper } from "./helper.js";


/**
 * Extend the base Actor document to support attributes and groups with a custom template creation dialog.
 * @extends {Actor}
 */
export class SimpleActor extends Actor {

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.system.groups = this.system.groups || {};
    this.system.attributes = this.system.attributes || {};
    EntitySheetHelper.clampResourceValues(this.system.attributes);
	const  actorData = this.data;
	const  data = actorData.data;
	const stats = [data.power,data.speed,data.spirit,data.recovery];
    const usedActive = [1,2,3,4,5,6,7,8,9,10,11];
	const usedPassive = [1,1,1,1,1,2,2,2,2,5];
	const scumUsesActive = [1,2,3,3,4,5,6,6,7,9];
	const scumUsesPassive = [1,1,1,1,1,2,2,2,2,4];
	const abilites = [data.AT1,data.AT2,data.AT3,data.AT4,data.AT5,data.AT6,data.AT7,data.AT8,data.AT9,data.AT10,data.AT11,data.AT12,data.AT13,data.AT14,data.AT15,data.AT16,data.AT17,data.AT18,data.AT19,data.AT20]
	const uses = [usedPassive,scumUsesPassive,usedActive,scumUsesActive]
	if (actorData.type === "character") {
	for (let i = 0; i < abilites.length; i++) {
		var temp=abilites[i].tu
		var x = 1;
		var t = 0
		if(abilites[i].type=="ScumPassive"){t=1}else if(abilites[i].type=="Active"){t=2}else if(abilites[i].type=="ScumActive"){t=3}
		while(temp==uses[t][x-1] || temp>uses[t][x-1]) {
			if(x>9){break;}
			temp=temp-uses[t][x-1];
			abilites[i].value=x+1;
			if(isNaN(temp/uses[t][x]) || (Math.round((temp/uses[t][x])*100))>99){
				abilites[i].next="(Capped)";
				abilites[i].value++;
			}else{abilites[i].next=temp+"/"+uses[t][x]+"("+Math.round((temp/uses[t][x])*100)+"%)"}
			x++;
		}
	}
	for (let i = 0; i < stats.length; i++) {
		stats[i].value = (abilites[i*5].value+abilites[1+i*5].value+abilites[2+i*5].value+abilites[3+i*5].value+abilites[4+i*5].value)/5;
	}	 
	data.rank.value = (((Number(data.power.value)+Number(data.speed.value)+Number(data.spirit.value)+Number(data.recovery.value))/4) ^ 0);
	data.rank.max = Math.ceil(data.rank.value/10);
	if((data.rank.value*4)>3 && (data.rank.value*4)<16 ){data.rank.max=1}
	const ranks = ["Unranked","Iron","Bronze","Silver","Gold","Diamond"]
	for (let i = 0; i < stats.length; i++) {
		stats[i].value+=stats[i].mod
		stats[i].display = ""+ranks[Number(data.rank.max)]+" "+((Number(stats[i].value))-(data.rank.max-1)*10 ^ 0)+" - ("+(((Number(stats[i].value)%1)*100) ^ 0)+"%)"
		if((stats[i].value*5)==0){stats[i].display="Unranked"
		}else if((stats[i].value*5)==1){stats[i].display="Iron 1 - (0%)"
		}else if((stats[i].value*5)==2){stats[i].display="Iron 1 - (0%)"
		}else if((stats[i].value*5)==3){stats[i].display="Iron 1 - (0%)"
		}else if((stats[i].value*5)==4){stats[i].display="Iron 1 - (0%)"}
		stats[i].value=Math.floor(stats[i].value)
	}
	temp=document.getElementById('healthmod').value
	var temp2=document.getElementById('healthmult').value

	data.health.max=((Math.floor(Number(data.spirit.value))*(3+Number(data.rank.max)))+Number(10)+Number(temp)+Number(data.rank.max)*Number(10)+(Math.floor(Number(data.recovery.value))*(6+Number(data.rank.max))))*data.health.mult
	data.health.mod=temp
	data.health.mult=temp2
	data.ac.value=5+Math.floor(data.power.value)+data.ac.modl;
	data.ac.max=15+Math.floor(data.power.value)+Math.floor(data.speed.value)-9*data.rank.max+data.ac.modh;
	data.movespeed.value=(Math.floor(data.speed.value/5)*Math.min((10+5*Math.floor(data.skills.acrobatics/data.rank.max)),20)+data.movespeed.mod)*data.movespeed.mult
	data.recovery.mana.value=Math.round(((0.1+data.rank.max/20)*Math.floor(data.recovery.value)+data.recovery.mana.mod)*data.recovery.mana.mult*100)/100
	data.recovery.stamina.value=Math.round(((0.1+data.rank.max/20)*Math.floor(data.recovery.value)+data.recovery.stamina.mod)*data.recovery.stamina.mult*100)/100
	data.recovery.health.value=Math.round(((data.rank.max/50)*Math.floor(data.recovery.value)+data.recovery.health.mod)*data.recovery.health.mult*1000)/1000
  }}
	

  /* -------------------------------------------- */


  /* -------------------------------------------- */

  /**
   * Is this Actor used as a template for other Actors?
   * @type {boolean}
   */
  get isTemplate() {
    return !!this.getFlag("essenceuser", "isTemplate");
  }

  /* -------------------------------------------- */
  /*  Roll Data Preparation                       */
  /* -------------------------------------------- */

  /** @inheritdoc */
  getRollData() {

    // Copy the actor's system data
    const data = this.toObject(false).system;
    const shorthand = game.settings.get("worldbuilding", "macroShorthand");
    const formulaAttributes = [];
    const itemAttributes = [];

    // Handle formula attributes when the short syntax is disabled.
    this._applyShorthand(data, formulaAttributes, shorthand);

    // Map all item data using their slugified names
    this._applyItems(data, itemAttributes, shorthand);

    // Evaluate formula replacements on items.
    this._applyItemsFormulaReplacements(data, itemAttributes, shorthand);

    // Evaluate formula attributes after all other attributes have been handled, including items.
    this._applyFormulaReplacements(data, formulaAttributes, shorthand);

    // Remove the attributes if necessary.
    if ( !!shorthand ) {
      delete data.attributes;
      delete data.attr;
      delete data.groups;
    }
    return data;
  }

  /* -------------------------------------------- */

  /**
   * Apply shorthand syntax to actor roll data.
   * @param {Object} data The actor's data object.
   * @param {Array} formulaAttributes Array of attributes that are derived formulas.
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyShorthand(data, formulaAttributes, shorthand) {
    // Handle formula attributes when the short syntax is disabled.
    for ( let [k, v] of Object.entries(data.attributes || {}) ) {
      // Make an array of formula attributes for later reference.
      if ( v.dtype === "Formula" ) formulaAttributes.push(k);
      // Add shortened version of the attributes.
      if ( !!shorthand ) {
        if ( !(k in data) ) {
          // Non-grouped attributes.
          if ( v.dtype ) {
            data[k] = v.value;
          }
          // Grouped attributes.
          else {
            data[k] = {};
            for ( let [gk, gv] of Object.entries(v) ) {
              data[k][gk] = gv.value;
              if ( gv.dtype === "Formula" ) formulaAttributes.push(`${k}.${gk}`);
            }
          }
        }
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Add items to the actor roll data object. Handles regular and shorthand
   * syntax, and calculates derived formula attributes on the items.
   * @param {Object} data The actor's data object.
   * @param {string[]} itemAttributes
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyItems(data, itemAttributes, shorthand) {
    // Map all items data using their slugified names
    data.items = this.items.reduce((obj, item) => {
      const key = item.name.slugify({strict: true});
      const itemData = item.toObject(false).system;

      // Add items to shorthand and note which ones are formula attributes.
      for ( let [k, v] of Object.entries(itemData.attributes) ) {
        // When building the attribute list, prepend the item name for later use.
        if ( v.dtype === "Formula" ) itemAttributes.push(`${key}..${k}`);
        // Add shortened version of the attributes.
        if ( !!shorthand ) {
          if ( !(k in itemData) ) {
            // Non-grouped item attributes.
            if ( v.dtype ) {
              itemData[k] = v.value;
            }
            // Grouped item attributes.
            else {
              if ( !itemData[k] ) itemData[k] = {};
              for ( let [gk, gv] of Object.entries(v) ) {
                itemData[k][gk] = gv.value;
                if ( gv.dtype === "Formula" ) itemAttributes.push(`${key}..${k}.${gk}`);
              }
            }
          }
        }
        // Handle non-shorthand version of grouped attributes.
        else {
          if ( !v.dtype ) {
            if ( !itemData[k] ) itemData[k] = {};
            for ( let [gk, gv] of Object.entries(v) ) {
              itemData[k][gk] = gv.value;
              if ( gv.dtype === "Formula" ) itemAttributes.push(`${key}..${k}.${gk}`);
            }
          }
        }
      }

      // Delete the original attributes key if using the shorthand syntax.
      if ( !!shorthand ) {
        delete itemData.attributes;
      }
      obj[key] = itemData;
      return obj;
    }, {});
  }

  /* -------------------------------------------- */

  _applyItemsFormulaReplacements(data, itemAttributes, shorthand) {
    for ( let k of itemAttributes ) {
      // Get the item name and separate the key.
      let item = null;
      let itemKey = k.split('..');
      item = itemKey[0];
      k = itemKey[1];

      // Handle group keys.
      let gk = null;
      if ( k.includes('.') ) {
        let attrKey = k.split('.');
        k = attrKey[0];
        gk = attrKey[1];
      }

      let formula = '';
      if ( !!shorthand ) {
        // Handle grouped attributes first.
        if ( data.items[item][k][gk] ) {
          formula = data.items[item][k][gk].replace('@item.', `@items.${item}.`);
          data.items[item][k][gk] = Roll.replaceFormulaData(formula, data);
        }
        // Handle non-grouped attributes.
        else if ( data.items[item][k] ) {
          formula = data.items[item][k].replace('@item.', `@items.${item}.`);
          data.items[item][k] = Roll.replaceFormulaData(formula, data);
        }
      }
      else {
        // Handle grouped attributes first.
        if ( data.items[item]['attributes'][k][gk] ) {
          formula = data.items[item]['attributes'][k][gk]['value'].replace('@item.', `@items.${item}.attributes.`);
          data.items[item]['attributes'][k][gk]['value'] = Roll.replaceFormulaData(formula, data);
        }
        // Handle non-grouped attributes.
        else if ( data.items[item]['attributes'][k]['value'] ) {
          formula = data.items[item]['attributes'][k]['value'].replace('@item.', `@items.${item}.attributes.`);
          data.items[item]['attributes'][k]['value'] = Roll.replaceFormulaData(formula, data);
        }
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Apply replacements for derived formula attributes.
   * @param {Object} data The actor's data object.
   * @param {Array} formulaAttributes Array of attributes that are derived formulas.
   * @param {Boolean} shorthand Whether or not the shorthand syntax is used.
   */
  _applyFormulaReplacements(data, formulaAttributes, shorthand) {
    // Evaluate formula attributes after all other attributes have been handled, including items.
    for ( let k of formulaAttributes ) {
      // Grouped attributes are included as `group.attr`, so we need to split them into new keys.
      let attr = null;
      if ( k.includes('.') ) {
        let attrKey = k.split('.');
        k = attrKey[0];
        attr = attrKey[1];
      }
      // Non-grouped attributes.
      if ( data.attributes[k]?.value ) {
        data.attributes[k].value = Roll.replaceFormulaData(String(data.attributes[k].value), data);
      }
      // Grouped attributes.
      else if ( attr ) {
        data.attributes[k][attr].value = Roll.replaceFormulaData(String(data.attributes[k][attr].value), data);
      }

      // Duplicate values to shorthand.
      if ( !!shorthand ) {
        // Non-grouped attributes.
        if ( data.attributes[k]?.value ) {
          data[k] = data.attributes[k].value;
        }
        // Grouped attributes.
        else {
          if ( attr ) {
            // Initialize a group key in case it doesn't exist.
            if ( !data[k] ) {
              data[k] = {};
            }
            data[k][attr] = data.attributes[k][attr].value;
          }
        }
      }
    }
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    const current = foundry.utils.getProperty(this.system, attribute);
    if ( !isBar || !isDelta || (current?.dtype !== "Resource") ) {
      return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    }
    const updates = {[`system.${attribute}.value`]: Math.clamped(current.value + value, current.min, current.max)};
    const allowed = Hooks.call("modifyTokenAttribute", {attribute, value, isDelta, isBar}, updates);
    return allowed !== false ? this.update(updates) : this;
  }
}
