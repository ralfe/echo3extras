// FIXME handle enabled/disabled state

/**
 * Component rendering peer: Menu
 */
ExtrasRender.ComponentSync.Menu = function() {
	this._menuModel = null;
	this._stateModel = null;
    /**
     * Array containing models of open menus.
     */
    this._openMenuPath = new Array();
    this._menuInsets = new EchoApp.Property.Insets(2, 2, 2, 2);
    this._menuItemInsets = new EchoApp.Property.Insets(1, 12, 1, 12);
    this._menuItemIconTextMargin = new EchoApp.Property.Extent(5);
};

ExtrasRender.ComponentSync.Menu._defaultForeground = new EchoApp.Property.Color("#000000");
ExtrasRender.ComponentSync.Menu._defaultBackground = new EchoApp.Property.Color("#cfcfcf");
ExtrasRender.ComponentSync.Menu._defaultDisabledForeground = new EchoApp.Property.Color("#7f7f7f");
ExtrasRender.ComponentSync.Menu._defaultSelectionForeground = new EchoApp.Property.Color("#ffffff");
ExtrasRender.ComponentSync.Menu._defaultSelectionBackground = new EchoApp.Property.Color("#3f3f3f");

ExtrasRender.ComponentSync.Menu.MAX_Z_INDEX = 65535;

ExtrasRender.ComponentSync.Menu.prototype = new EchoRender.ComponentSync;

ExtrasRender.ComponentSync.Menu.prototype.renderAdd = function(update, parentElement) {
	this._menuModel = this.component.getProperty("model");
	this._stateModel = this.component.getProperty("stateModel");
	
    var element = this._renderMain();
    
	EchoWebCore.EventProcessor.addSelectionDenialListener(element);
    
    parentElement.appendChild(element);
};

ExtrasRender.ComponentSync.Menu.prototype.renderUpdate = function(update) {
    EchoRender.Util.renderRemove(update, update.parent);
    var containerElement = EchoRender.Util.getContainerElement(update.parent);
    this.renderAdd(update, containerElement);
    return true;
};

ExtrasRender.ComponentSync.Menu.prototype.renderDispose = function(update) {
    var element = document.getElementById(this.component.renderId);
	EchoWebCore.EventProcessor.removeAll(element);
	this._menuModel = null;
	this._stateModel = null;
    this._openMenuPath = new Array();
};

ExtrasRender.ComponentSync.Menu.prototype._activateItem = function(itemModel) {
    if (!this._stateModel.isEnabled(itemModel.id)) {
        return;
    }
    if (itemModel instanceof ExtrasApp.OptionModel) {
        this._removeMask();
        this._closeDescendantMenus(null);
        this._doAction(itemModel);
    } else if (itemModel instanceof ExtrasApp.MenuModel) {
        this._openMenu(itemModel);
    }
};

/**
 * @return true if the menu should be opened, false it if is already opened
 */
ExtrasRender.ComponentSync.Menu.prototype._prepareOpenMenu = function(menuModel) {
    if (this._openMenuPath.length != 0) {
        var openMenu = this._openMenuPath[this._openMenuPath.length - 1];
        if (openMenu.id == menuModel.id || menuModel.parent == null) {
            // Do nothing: menu is already open
            return false;
        }
        if (openMenu.id != menuModel.parent.id) {
            // Close previous menu
            this._closeDescendantMenus(menuModel.parent);
        }
    }
    
    this._openMenuPath.push(menuModel);
    return true;
    
};

ExtrasRender.ComponentSync.Menu.prototype._openMenu = function(menuModel) {
    if (!this._prepareOpenMenu(menuModel)) {
        // Do nothing: menu is already open.
        return;
    }

    var menuElement = this._getMenuElement(menuModel);
    if (this._isTopMenuElement(menuElement)) { 
        this._renderTopMenu(menuModel);
    } else {
        this._renderSubMenu(menuModel);
    }
};

ExtrasRender.ComponentSync.Menu.prototype._renderTopMenu = function(menuModel) {
    var menuElement = this._getMenuElement(menuModel);
    var containerElement = document.getElementById(this.component.renderId);
    
    var menuBounds = new EchoWebCore.Render.Measure.Bounds(menuElement);
    var containerBounds = new EchoWebCore.Render.Measure.Bounds(containerElement);
    
    this._renderMenu(menuModel, menuBounds.left, containerBounds.top + containerBounds.height);
	// FIXME handle overflow
};

ExtrasRender.ComponentSync.Menu.prototype._renderSubMenu = function(menuModel) {
    var menuElement = this._getMenuElement(menuModel);
    var containerElement = menuElement.parentNode.parentNode.parentNode;
    
    var menuBounds = new EchoWebCore.Render.Measure.Bounds(menuElement);
    var containerBounds = new EchoWebCore.Render.Measure.Bounds(containerElement);
    
    this._renderMenu(menuModel, containerBounds.left + containerBounds.width, menuBounds.top);
};

ExtrasRender.ComponentSync.Menu.prototype._renderMenu = function(menuModel, xPosition, yPosition) {
    var menuDivElement = document.createElement("div");
    menuDivElement.id = this.component.renderId + "_menu_" + menuModel.id;
    EchoRender.Property.Insets.renderPixel(this._menuInsets, menuDivElement, "padding");
	EchoRender.Property.Border.render(this._getMenuBorder(), menuDivElement);
    var background;
    var menuBackground = this.component.getRenderProperty("menuBackground");
    if (menuBackground) {
    	background = menuBackground;
    } else {
    	background = this.component.getRenderProperty("background", ExtrasRender.ComponentSync.Menu._defaultBackground);
    }
    EchoRender.Property.Color.render(background, menuDivElement, "backgroundColor");
    var foreground;
    var menuForeground = this.component.getRenderProperty("menuForeground");
    if (menuForeground) {
    	foreground = menuForeground;
    } else {
    	foreground = this.component.getRenderProperty("foreground", ExtrasRender.ComponentSync.Menu._defaultForeground);
    }
    EchoRender.Property.Color.render(foreground, menuDivElement, "color");
    menuDivElement.style.zIndex = ExtrasRender.ComponentSync.Menu.MAX_Z_INDEX;
    // Apply menu background image if it is set, or apply default background 
    // image if it is set and the menu background is NOT set.
    var backgroundImage;
    var menuBackgroundImage = this.component.getRenderProperty("menuBackgroundImage");
    if (menuBackgroundImage) {
    	backgroundImage = menuBackgroundImage;
    } else if (menuBackground == null) {
    	backgroundImage = this.component.getRenderProperty("backgroundImage");
    }
    if (backgroundImage) {
	    EchoRender.Property.FillImage.render(backgroundImage, menuDivElement, null); 
    }
	// Apply menu font if it is set, or apply default font 
	// if it is set and the menu font is NOT set.
    var font = this.component.getRenderProperty("menuFont");
    if (!font) {
    	font = this.component.getRenderProperty("font");
    }
    if (font) {
	    EchoRender.Property.Font.render(font, menuDivElement);
    }
    menuDivElement.style.position = "absolute";
    menuDivElement.style.top = yPosition + "px";
    menuDivElement.style.left = xPosition + "px";
    
    var menuTableElement = document.createElement("table");
    menuTableElement.style.borderCollapse = "collapse";
    menuDivElement.appendChild(menuTableElement);
    
    var menuTbodyElement = document.createElement("tbody");
    menuTableElement.appendChild(menuTbodyElement);

    var items = menuModel.items;
    
    // Determine if any icons are present.
    var hasIcons = false;
    for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        if (item.icon || item instanceof ExtrasApp.ToggleOptionModel) {
            hasIcons = true;
            break;
        }
    }
    var textPadding, iconPadding;
    if (hasIcons) {
        iconPadding = new EchoApp.Property.Insets(0, 0, 0, this._menuItemInsets.left);
        textPadding = new EchoApp.Property.Insets(this._menuItemInsets.top, this._menuItemInsets.right, this._menuItemInsets.bottom, this._menuItemIconTextMargin);
    } else {
        textPadding = this._menuItemInsets;
    }
    
    for (var i = 0; i < items.length; ++i) {
        var item = items[i];
        if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
            var menuItemTrElement = document.createElement("tr");
            menuItemTrElement.id = this.component.renderId + "_tr_item_" + item.id;
            menuItemTrElement.style.cursor = "pointer";
            menuTbodyElement.appendChild(menuItemTrElement);

            if (hasIcons) {
                var menuItemIconTdElement = document.createElement("td");
	            EchoRender.Property.Insets.renderPixel(iconPadding, menuItemIconTdElement, "padding");
                if (item instanceof ExtrasApp.ToggleOptionModel) {
                    var iconIdentifier;
                    var selected = this._stateModel.isSelected(item.id);
                    if (item instanceof ExtrasApp.RadioOptionModel) {
                        iconIdentifier = selected ? "radioOn" : "radioOff";
                    } else {
                        iconIdentifier = selected ? "toggleOn" : "toggleOff";
                    }
                    var imgElement = document.createElement("img");
                    imgElement.setAttribute("src", ExtrasRender.ComponentSync.Menu._getImageUri(iconIdentifier));
                    imgElement.setAttribute("alt", "");
                    menuItemIconTdElement.appendChild(imgElement);
                } else if (item.icon) {
                    var imgElement = document.createElement("img");
                    imgElement.setAttribute("src", item.icon.url);
                    imgElement.setAttribute("alt", "");
                    menuItemIconTdElement.appendChild(imgElement);
                }
                menuItemTrElement.appendChild(menuItemIconTdElement);
            }
            
            var menuItemContentTdElement = document.createElement("td");
            EchoRender.Property.Insets.renderPixel(textPadding, menuItemContentTdElement, "padding");
            var lineWrap = this.component.getRenderProperty("lineWrap");
            if (lineWrap != null && !lineWrap) {
	            menuItemContentTdElement.style.whiteSpace = "nowrap";
            }
            if (!this._stateModel.isEnabled(item.id)) {
            	EchoRender.Property.Color.renderComponentProperty(this.component, "disabledForeground", ExtrasRender.ComponentSync.Menu._defaultDisabledForeground, menuItemContentTdElement, "color");
            }
            menuItemContentTdElement.title = item.text;
            menuItemContentTdElement.appendChild(document.createTextNode(item.text));
            menuItemTrElement.appendChild(menuItemContentTdElement);
            
            if (item instanceof ExtrasApp.MenuModel) {
                // Submenus have adjacent column containing 'expand' icons.
                var menuItemArrowTdElement = document.createElement("td");
                menuItemArrowTdElement.style.textAlign = "right";
                var imgElement = document.createElement("img");
                imgElement.setAttribute("src", ExtrasRender.ComponentSync.Menu._getImageUri("submenuRight"));
                imgElement.setAttribute("alt", "");
                menuItemArrowTdElement.appendChild(imgElement);
                menuItemTrElement.appendChild(menuItemArrowTdElement);
            } else {
                // Menu items fill both columns.
                menuItemContentTdElement.colSpan = 2;
            }
        } else if (item instanceof ExtrasApp.SeparatorModel) {
            var menuItemTrElement = document.createElement("tr");
            menuTbodyElement.appendChild(menuItemTrElement);
            var menuItemContentTdElement = document.createElement("td");
            menuItemContentTdElement.colSpan = hasIcons ? 3 : 2;
            menuItemContentTdElement.style.padding = "3px 0px";
            var hrDivElement = document.createElement("div");
            hrDivElement.style.borderTopWidth = "1px";
            hrDivElement.style.borderTopStyle = "solid";
            hrDivElement.style.borderTopColor = "#a7a7a7";
            hrDivElement.style.height = "0px";
            hrDivElement.style.fontSize = "1px";
            hrDivElement.style.lineHeight = "0px";
            menuItemContentTdElement.appendChild(hrDivElement);
            menuItemTrElement.appendChild(menuItemContentTdElement);
        }
    }
    
    bodyElement = document.getElementsByTagName("body")[0];    
    bodyElement.appendChild(menuDivElement);

    EchoWebCore.EventProcessor.add(menuDivElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
    EchoWebCore.EventProcessor.add(menuDivElement, "mouseover", new EchoCore.MethodRef(this, this._processItemEnter), false);
    EchoWebCore.EventProcessor.add(menuDivElement, "mouseout", new EchoCore.MethodRef(this, this._processItemExit), false);
	EchoWebCore.EventProcessor.addSelectionDenialListener(menuDivElement);
    
    return menuDivElement;
};

ExtrasRender.ComponentSync.Menu.prototype._disposeMenu = function(menuModel) {
    var menuElement = document.getElementById(this.component.renderId + "_menu_" + menuModel.id);

    EchoWebCore.EventProcessor.removeAll(menuElement);
    menuElement.parentNode.removeChild(menuElement);
};

ExtrasRender.ComponentSync.Menu.prototype._highlight = function(menuModel, state) {
    if (!this._stateModel.isEnabled(menuModel.id)) {
        return;
    }
    var menuElement = this._getMenuElement(menuModel);
    if (state) {
        EchoRender.Property.FillImage.renderComponentProperty(this.component, "selectionBackgroundImage", null, menuElement);
        EchoRender.Property.Color.renderComponentProperty(this.component, "selectionBackground", ExtrasRender.ComponentSync.Menu._defaultSelectionBackground, menuElement, "backgroundColor");
        EchoRender.Property.Color.renderComponentProperty(this.component, "selectionForeground", ExtrasRender.ComponentSync.Menu._defaultSelectionForeground, menuElement, "color");
    } else {
        menuElement.style.backgroundImage = "";
        menuElement.style.backgroundColor = "";
        menuElement.style.color = "";
    }
};

ExtrasRender.ComponentSync.Menu.prototype._processItemEnter = function(e) {
    var modelId = ExtrasRender.ComponentSync.Menu._getElementModelId(e.target);
	this._highlight(this._menuModel.getItem(modelId), true);
};

ExtrasRender.ComponentSync.Menu.prototype._processItemExit = function(e) {
    var modelId = ExtrasRender.ComponentSync.Menu._getElementModelId(e.target);
	this._highlight(this._menuModel.getItem(modelId), false);
};

ExtrasRender.ComponentSync.Menu.prototype._processCancel = function() {
    this._removeMask();
    this._closeDescendantMenus(null);
};

/**
 * @param menuModel the menu model whose descendants should be closed;
 * the menu model itself will remain open; providing null will close all descendant menus; 
 */
ExtrasRender.ComponentSync.Menu.prototype._closeDescendantMenus = function(menuModel) {
    for (var i = this._openMenuPath.length - 1;  i >= 0; --i) {
        if (menuModel != null && this._openMenuPath[i].id == menuModel.id) {
            // Stop once specified menu is found.
            return;
        }
        this._disposeMenu(this._openMenuPath[i]);
        --this._openMenuPath.length;
    }
};

/**
 * Gets an URI for default menu images.
 * 
 * @param {String} identifier the image identifier
 * @return the image URI
 * @type {String}
 */
ExtrasRender.ComponentSync.Menu._getImageUri = function(identifier) {
	// FIXME abstract this somehow so it works with FreeClient too
	return "?sid=EchoExtras.Menu.Image&imageuid=" + identifier;
};

ExtrasRender.ComponentSync.Menu._getElementModelId = function(element) {
    if (!element.id) {
        return ExtrasRender.ComponentSync.Menu._getElementModelId(element.parentNode);
    }
    if (element.id.indexOf("_item_") == -1) {
        return null;
    }
    return element.id.substring(element.id.lastIndexOf("_") + 1);
};

ExtrasRender.ComponentSync.Menu.prototype._getBorder = function() {
    var border = this.component.getRenderProperty("border");
	if (!border) {
		border = new EchoApp.Property.Border("1px outset #cfcfcf");
	}
	return border;
};

ExtrasRender.ComponentSync.Menu.prototype._getMenuBorder = function() {
	var border = this.component.getRenderProperty("menuBorder");
	if (!border) {
		border = this._getBorder();
	}
	return border;
};

/**
 * Component rendering peer: MenuBarPane
 */
ExtrasRender.ComponentSync.MenuBarPane = function() {
    this._itemInsets = new EchoApp.Property.Insets("0px 12px");
};

ExtrasRender.ComponentSync.MenuBarPane.prototype = new ExtrasRender.ComponentSync.Menu;

ExtrasRender.ComponentSync.MenuBarPane.prototype._renderMain = function() {
    var menuBarDivElement = document.createElement("div");
    menuBarDivElement.id = this.component.renderId;
    menuBarDivElement.style.position = "absolute";
    menuBarDivElement.style.left = "0px";
    menuBarDivElement.style.right = "0px";
    menuBarDivElement.style.top = "0px";
    menuBarDivElement.style.bottom = "0px";
    
    EchoRender.Property.Color.renderFB(this.component, menuBarDivElement);
    var border = this._getBorder();
    EchoRender.Property.Border.renderSide(border, menuBarDivElement, "borderTop");
    EchoRender.Property.Border.renderSide(border, menuBarDivElement, "borderBottom");
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "backgroundImage", null, menuBarDivElement); 
    
    var menuBarTableElement = document.createElement("table");
    menuBarTableElement.style.height = "100%";
    menuBarTableElement.style.borderCollapse = "collapse";
    menuBarDivElement.appendChild(menuBarTableElement);
    
    var menuBarTbodyElement = document.createElement("tbody");
    menuBarTableElement.appendChild(menuBarTbodyElement);
    
    var menuBarTrElement = document.createElement("tr");
    menuBarTbodyElement.appendChild(menuBarTrElement);
    
    if (this._menuModel != null) {
        var items = this._menuModel.items;
        for (var i = 0; i < items.length; ++i) {
            var item = items[i];
            if (item instanceof ExtrasApp.OptionModel || item instanceof ExtrasApp.MenuModel) {
                var menuBarItemTdElement = document.createElement("td");
                menuBarItemTdElement.id = this.component.renderId + "_bar_td_item_" + item.id;
                menuBarItemTdElement.style.padding = "0px";
                menuBarItemTdElement.style.height = "100%";
                menuBarItemTdElement.style.cursor = "pointer";
                menuBarTrElement.appendChild(menuBarItemTdElement);
                var menuBarItemDivElement = document.createElement("div");
                EchoRender.Property.Insets.renderPixel(this._itemInsets, menuBarItemDivElement, "padding");
                menuBarItemTdElement.appendChild(menuBarItemDivElement);
                var textNode = document.createTextNode(item.text);
                menuBarItemDivElement.appendChild(textNode);
            }
        }
    }
    
    EchoWebCore.EventProcessor.add(menuBarDivElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
    EchoWebCore.EventProcessor.add(menuBarDivElement, "mouseover", new EchoCore.MethodRef(this, this._processItemEnter), false);
    EchoWebCore.EventProcessor.add(menuBarDivElement, "mouseout", new EchoCore.MethodRef(this, this._processItemExit), false);

    EchoWebCore.VirtualPosition.register(menuBarDivElement.id);
    
    return menuBarDivElement;
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._isTopMenuElement = function(element) {
    return element.id.indexOf("_bar_td_item") != -1;
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._getMenuElement = function(itemModel) {
    var menuElement = document.getElementById(this.component.renderId + "_bar_td_item_" + itemModel.id);
    if (menuElement == null) {
        menuElement = document.getElementById(this.component.renderId + "_tr_item_" + itemModel.id);
    }
    return menuElement;
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._renderMask = function() {
    if (this.maskDeployed) {
        return;
    }
    this.maskDeployed = true;
    
    var menuElement = document.getElementById(this.component.renderId);
    var bounds = new EchoWebCore.Render.Measure.Bounds(menuElement);
    
    var bodyElement = document.getElementsByTagName("body")[0];    
    
    var topBlockDivElement = document.createElement("div");
    topBlockDivElement.id = this.component.renderId + "_block_top";
    topBlockDivElement.style.position = "absolute";
    topBlockDivElement.style.top = "0px";
    topBlockDivElement.style.left = "0px";
    topBlockDivElement.style.width = "100%";
    topBlockDivElement.style.height = bounds.top + "px";
    topBlockDivElement.style.backgroundImage = "url(" + EchoRender.Util.TRANSPARENT_IMAGE + ")";
    bodyElement.appendChild(topBlockDivElement);

    var bottomBlockDivElement = document.createElement("div");
    bottomBlockDivElement.id = this.component.renderId + "_block_bottom";
    bottomBlockDivElement.style.position = "absolute";
    var height = Math.max(0, (document.documentElement.clientHeight - (bounds.top + bounds.height)));
    bottomBlockDivElement.style.height = height + "px";
    bottomBlockDivElement.style.left = "0px";
    bottomBlockDivElement.style.width = "100%";
    bottomBlockDivElement.style.bottom = "0px";
    bottomBlockDivElement.style.backgroundImage = "url(" + EchoRender.Util.TRANSPARENT_IMAGE + ")";
    bodyElement.appendChild(bottomBlockDivElement);

    var leftBlockDivElement = document.createElement("div");
    leftBlockDivElement.id = this.component.renderId + "_block_left";
    leftBlockDivElement.style.position = "absolute";
    leftBlockDivElement.style.top = bounds.top + "px";
    leftBlockDivElement.style.left = "0px";
    leftBlockDivElement.style.width = bounds.left + "px";
    leftBlockDivElement.style.height = bounds.height + "px";
    leftBlockDivElement.style.backgroundImage = "url(" + EchoRender.Util.TRANSPARENT_IMAGE + ")";
    bodyElement.appendChild(leftBlockDivElement);

    var rightBlockDivElement = document.createElement("div");
    rightBlockDivElement.id = this.component.renderId + "_block_right";
    rightBlockDivElement.style.position = "absolute";
    rightBlockDivElement.style.top = bounds.top + "px";
    rightBlockDivElement.style.right = "0px";
    rightBlockDivElement.style.height = bounds.height + "px";
    rightBlockDivElement.style.width = (document.documentElement.clientWidth - (bounds.left + bounds.width)) + "px";
    rightBlockDivElement.style.backgroundImage = "url(" + EchoRender.Util.TRANSPARENT_IMAGE + ")";
    bodyElement.appendChild(rightBlockDivElement);

	var cancelRef = new EchoCore.MethodRef(this, this._processCancel);
    EchoWebCore.EventProcessor.add(topBlockDivElement, "click", cancelRef, false);
    EchoWebCore.EventProcessor.add(bottomBlockDivElement, "click", cancelRef, false);
    EchoWebCore.EventProcessor.add(leftBlockDivElement, "click", cancelRef, false);
    EchoWebCore.EventProcessor.add(rightBlockDivElement, "click", cancelRef, false);
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._removeMask = function() {
    if (!this.maskDeployed) {
        return;
    }
    this.maskDeployed = false;

    var bodyElement = document.getElementsByTagName("body")[0];    
    var topBlockDivElement = document.getElementById(this.component.renderId + "_block_top");
    if (topBlockDivElement) {
		EchoWebCore.EventProcessor.removeAll(topBlockDivElement);
        bodyElement.removeChild(topBlockDivElement);
    }
    var bottomBlockDivElement = document.getElementById(this.component.renderId + "_block_bottom");
    if (bottomBlockDivElement) {
		EchoWebCore.EventProcessor.removeAll(bottomBlockDivElement);
        bodyElement.removeChild(bottomBlockDivElement);
    }
    var leftBlockDivElement = document.getElementById(this.component.renderId + "_block_left");
    if (leftBlockDivElement) {
		EchoWebCore.EventProcessor.removeAll(leftBlockDivElement);
        bodyElement.removeChild(leftBlockDivElement);
    }
    var rightBlockDivElement = document.getElementById(this.component.renderId + "_block_right");
    if (rightBlockDivElement) {
		EchoWebCore.EventProcessor.removeAll(rightBlockDivElement);
        bodyElement.removeChild(rightBlockDivElement);
    }
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    
    EchoWebCore.DOM.preventEventDefault(e);

    var modelId = ExtrasRender.ComponentSync.Menu._getElementModelId(e.target);
    if (modelId) {
	    this._renderMask();
	    this._activateItem(this._menuModel.getItem(modelId));
    } else {
        this._processCancel();
    }
};

ExtrasRender.ComponentSync.MenuBarPane.prototype._doAction = function(menuModel) {
    var path = menuModel.getItemPositionPath().join(".");
    // FIXME broken
    this.component.setProperty("selection", path);
    this.component.fireEvent(new EchoCore.Event(this.component, "select"));
};

/**
 * Component rendering peer: DropDownMenu
 */
ExtrasRender.ComponentSync.DropDownMenu = function() {
	this._selectedItem = null;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype = new ExtrasRender.ComponentSync.Menu;

ExtrasRender.ComponentSync.DropDownMenu.prototype._renderMain = function() {
    var dropDownDivElement = document.createElement("div");
    dropDownDivElement.id = this.component.renderId;
    dropDownDivElement.style.cursor = "pointer";
    dropDownDivElement.style.overflow = "hidden";
    var width = this.component.getRenderProperty("width");
    if (width) {
        dropDownDivElement.style.width = width.toString();
    } else {
    	// if the width is not set, IE won't fire click events.
    	dropDownDivElement.style.width = "100%";
    }
    var height = this.component.getRenderProperty("height");
    if (height) {
        dropDownDivElement.style.height = height.toString();
    }
    EchoRender.Property.Color.renderFB(this.component, dropDownDivElement);
    
    var relativeContainerDivElement = document.createElement("div");
    relativeContainerDivElement.style.position = "relative";
    relativeContainerDivElement.style.height = "100%";
    //EchoRender.Property.Insets.renderComponentProperty(this.component, "insets", null, relativeContainerDivElement, "padding");
    relativeContainerDivElement.appendChild(document.createTextNode("\u00a0"));
    
    var expandIcon = this.component.getRenderProperty("expandIcon", ExtrasRender.ComponentSync.Menu._getImageUri("submenuDown"));
    var expandIconWidth = this.component.getRenderProperty("expandIconWidth", new EchoApp.Property.Extent("10px"));
    
    var expandElement = document.createElement("span");
    expandElement.style.position = "absolute";
    expandElement.style.height = "100%";
    expandElement.style.top = "0px";
    expandElement.style.right = "0px";
    var imgElement = document.createElement("img");
    imgElement.src = expandIcon.url ? expandIcon.url : expandIcon;
    expandElement.appendChild(imgElement);
    relativeContainerDivElement.appendChild(expandElement);
    
    var contentDivElement = document.createElement("div");
    contentDivElement.id = this.component.renderId + "_contentwrapper";
    contentDivElement.style.position = "absolute";
    contentDivElement.style.top = "0px";
    contentDivElement.style.left = "0px";
	contentDivElement.style.right = expandIconWidth.toString();
	var insets = this.component.getRenderProperty("insets");
	if (insets) {
	    EchoRender.Property.Insets.renderPixel(insets, contentDivElement, "padding");
	    if (height) {
	    	var compensatedHeight = Math.max(0, height.value - insets.top.value - insets.bottom.value);
		    contentDivElement.style.height = compensatedHeight + "px";
	    }
	} else {
	    contentDivElement.style.height = "100%";
	}
    EchoRender.Property.FillImage.renderComponentProperty(this.component, "backgroundImage", null, contentDivElement); 
    
    var contentSpanElement = document.createElement("div");
    contentSpanElement.id = this.component.renderId + "_content";
    contentSpanElement.style.height = "100%";
    contentSpanElement.style.width = "100%";
    contentSpanElement.style.overflow = "hidden";
    contentSpanElement.style.whiteSpace = "nowrap";
    EchoRender.Property.Font.renderDefault(this.component, contentSpanElement, null);
    contentDivElement.appendChild(contentSpanElement);
    
    relativeContainerDivElement.appendChild(contentDivElement);
    dropDownDivElement.appendChild(relativeContainerDivElement);

    EchoWebCore.EventProcessor.add(dropDownDivElement, "click", new EchoCore.MethodRef(this, this._processClick), false);
    
    EchoWebCore.VirtualPosition.register(contentDivElement.id);

    if (this._isSelectionEnabled()) {
    	var selection = this.component.getRenderProperty("selection");
    	if (selection) {
	    	this._setSelection(this._menuModel.getItemModelFromPositions(selection.split(".")), contentSpanElement);
    	}
    }
    
    return dropDownDivElement;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._renderMenu = function(menuModel, xPosition, yPosition) {
	var menuDivElement = ExtrasRender.ComponentSync.Menu.prototype._renderMenu.call(this, menuModel, xPosition, yPosition);
    
    var menuWidth = this.component.getRenderProperty("menuWidth");
    if (menuWidth) {
	    menuDivElement.style.width = menuWidth;
	    menuDivElement.style.overflowX = "hidden";
	    menuDivElement.firstChild.style.width = "100%";
	}
    var menuHeight = this.component.getRenderProperty("menuHeight");
    if (menuHeight) {
	    if (EchoWebCore.Environment.NOT_SUPPORTED_CSS_MAX_HEIGHT) {
		    var measure = new EchoWebCore.Render.Measure(menuDivElement);
		    if (measure.height > menuHeight.value) {
			    menuDivElement.style.height = menuHeight.value + "px";
		    }
	    } else {
		    menuDivElement.style.maxHeight = menuHeight;
	    }
	    menuDivElement.style.overflowY = "auto";
	}
	return menuDivElement;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype.renderDispose = function(update) {
	ExtrasRender.ComponentSync.Menu.prototype.renderDispose.call(this, update);
	this._selectedItem = null;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._isSelectionEnabled = function() {
    return this.component.getRenderProperty("selectionEnabled");
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._isTopMenuElement = function(element) {
    return element.id == this.component.renderId;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._getMenuElement = function(itemModel) {
    var menuElement = document.getElementById(this.component.renderId + "_tr_item_" + itemModel.id);
    if (menuElement == null) {
        menuElement = document.getElementById(this.component.renderId);
    }
    return menuElement;
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._renderMask = function() {
    if (this.maskDeployed) {
        return;
    }
    this.maskDeployed = true;
    
    var bodyElement = document.getElementsByTagName("body")[0];    
    
    var blockDivElement = document.createElement("div");
    blockDivElement.id = this.component.renderId + "_block";
    blockDivElement.style.position = "absolute";
    blockDivElement.style.top = "0px";
    blockDivElement.style.left = "0px";
    blockDivElement.style.width = "100%";
    blockDivElement.style.height = "100%";
    blockDivElement.style.backgroundImage = "url(" + EchoRender.Util.TRANSPARENT_IMAGE + ")";
    bodyElement.appendChild(blockDivElement);

    EchoWebCore.EventProcessor.add(blockDivElement, "click", new EchoCore.MethodRef(this, this._processCancel), false);
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._removeMask = function() {
    if (!this.maskDeployed) {
        return;
    }
    this.maskDeployed = false;

    var bodyElement = document.getElementsByTagName("body")[0];    
    var blockDivElement = document.getElementById(this.component.renderId + "_block");
    if (blockDivElement) {
		EchoWebCore.EventProcessor.removeAll(blockDivElement);
        bodyElement.removeChild(blockDivElement);
    }
};

/**
 * Sets the selection to the given menu model.
 *
 * @param menuModel the model to select
 * @param contentElement the contentElement element, may be null
 */
ExtrasRender.ComponentSync.DropDownMenu.prototype._setSelection = function(menuModel, contentElement) {
	if (this._selectedItem == menuModel) {
		return;
	}
	this._selectedItem = menuModel;
    
    if (!contentElement) {
    	contentElement = document.getElementById(this.component.renderId + "_content");
    }
    for (var i = contentElement.childNodes.length - 1; i >= 0; --i) {
        contentElement.removeChild(contentElement.childNodes[i]);
    }
    
    if (menuModel.text) {
        if (menuModel.icon) {
            // Render Text and Icon
            var tableElement = document.createElement("table");
            var tbodyElement = document.createElement("tbody");
            var trElement = document.createElement("tr");
            var tdElement = document.createElement("td");
            var imgElement = document.createElement("img");
            imgElement.src = menuModel.icon.url;
            tdElement.appendChild(imgElement);
            trElement.appendChild(tdElement);
            tdElement = document.createElement("td");
            tdElement.style.width = "3px";
            trElement.appendChild(tdElement);
            tdElement = document.createElement("td");
            tdElement.appendChild(document.createTextNode(menuModel.text));
            trElement.appendChild(tdElement);
            tbodyElement.appendChild(trElement);
            tableElement.appendChild(tbodyElement);
            contentElement.appendChild(tableElement);
        } else {
            // Render Text Only
            contentElement.appendChild(document.createTextNode(menuModel.text));
        }
    } else if (menuModel.icon) {
        // Render Icon Only
        var imgElement = document.createElement("img");
        imgElement.src = menuModel.icon.url;
        contentElement.appendChild(imgElement);
    }
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._processClick = function(e) {
    if (!this.component.isActive()) {
        return;
    }
    
    EchoWebCore.DOM.preventEventDefault(e);

    var modelId = ExtrasRender.ComponentSync.Menu._getElementModelId(e.target);
    var model;
    if (modelId) {
    	model = this._menuModel.getItem(modelId);
    } else {
    	model = this._menuModel;
    }
    
    this._renderMask();
    this._activateItem(model);
};

ExtrasRender.ComponentSync.DropDownMenu.prototype._doAction = function(menuModel) {
    if (this._isSelectionEnabled()) {
    	this._setSelection(menuModel);
    }
    var path = menuModel.getItemPositionPath().join(".");
    // FIXME broken
    this.component.setProperty("selection", path);
    this.component.fireEvent(new EchoCore.Event(this.component, "select"));
};

EchoRender.registerPeer("nextapp.echo.extras.app.MenuBarPane", ExtrasRender.ComponentSync.MenuBarPane);
EchoRender.registerPeer("nextapp.echo.extras.app.DropDownMenu", ExtrasRender.ComponentSync.DropDownMenu);