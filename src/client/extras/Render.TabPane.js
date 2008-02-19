// FIXME handle enabled/disabled state

/**
 * Component rendering peer: TabPane
 */
ExtrasRender.ComponentSync.TabPane = Core.extend(EchoRender.ComponentSync, {

    $static: {
        _supportedPartialProperties: ["activeTab"],
        _paneInsets: 0,
        _defaultBorderType: ExtrasApp.TabPane.BORDER_TYPE_ADJACENT_TO_TABS,
        _defaultForeground: "#000000",
        _defaultInsets: 2,
        _defaultTabActiveBorder: "1px solid #00004f",
        _defaultTabActiveHeightIncrease: 2,
        _defaultTabAlignment: "top",
        _defaultTabCloseIconTextMargin: 5,
        _defaultTabContentInsets: 0,
        _defaultTabHeight: 32,
        _defaultTabIconTextMargin: 5,
        _defaultTabInactiveBorder: "1px solid #7f7f7f",
        _defaultTabInset: 10,
        _defaultTabInsets: "3px 8px",
        _defaultTabPosition: ExtrasApp.TabPane.TAB_POSITION_TOP,
        _defaultTabSpacing: 0
    },
    
    _element: null,
    _activeTabId: null,
    _tabs: null,
    _contentContainerDivElement: null,
    _headerContainerTrElement: null,
    
    $load: function() {
        EchoRender.registerPeer("ExtrasApp.TabPane", this);
    },
    
    $construct: function() {
        this._tabs = [];
    },
    
    /**
     * Adds a tab.
     */
    _addTab: function(update, tab, index) {
        if (index == null || index == this._tabs.length) {
            this._tabs.push(tab);
            tab._render(update);
            this._headerContainerTrElement.appendChild(tab._headerTdElement);
            this._contentContainerDivElement.appendChild(tab._contentDivElement);
        } else {
            this._tabs.splice(index, 0, tab);
            tab._render(update);
            this._headerContainerTrElement.insertBefore(tab._headerTdElement, 
                    this._headerContainerTrElement.childNodes[index]);
            this._contentContainerDivElement.insertBefore(tab._contentDivElement,
                    this._contentContainerDivElement.childNodes[index]);
        }
    },
    
    /**
     * Removes a specific tab.
     *
     * @param tab the tab to remove
     */
    _removeTab: function(tab) {
        var tabIndex = Core.Arrays.indexOf(this._tabs, tab);
        if (tabIndex == -1) {
            return;
        }
        if (tab._childComponent.renderId == this._activeTabId) {
            this._activeTabId = null;
        }
        this._tabs.splice(tabIndex, 1);
    
        tab._headerTdElement.parentNode.removeChild(tab._headerTdElement);
        tab._contentDivElement.parentNode.removeChild(tab._contentDivElement);
        tab._dispose();
    },
    
    _render: function() {
        this._borderType = this.component.render("borderType", ExtrasRender.ComponentSync.TabPane._defaultBorderType);
        this._insets = this.component.render("insets", ExtrasRender.ComponentSync.TabPane._defaultInsets);
        this._tabActiveBorder = this.component.render("tabActiveBorder", 
                ExtrasRender.ComponentSync.TabPane._defaultTabActiveBorder);
        this._tabActiveHeightIncreasePx = EchoAppRender.Extent.toPixels(this.component.render("tabActiveHeightIncrease", 
                ExtrasRender.ComponentSync.TabPane._defaultTabActiveHeightIncrease));
        this._tabInactiveBorder = this.component.render("tabInactiveBorder", 
                ExtrasRender.ComponentSync.TabPane._defaultTabInactiveBorder);
        this._tabHeightPx = EchoAppRender.Extent.toPixels(this.component.render("tabHeight",
                ExtrasRender.ComponentSync.TabPane._defaultTabHeight));
        this._tabInsetPx = EchoAppRender.Extent.toPixels(this.component.render("tabInset",
                 ExtrasRender.ComponentSync.TabPane._defaultTabInset));
        this._tabPosition = this.component.render("tabPosition", ExtrasRender.ComponentSync.TabPane._defaultTabPosition);
        this._tabSpacing = this.component.render("tabSpacing", ExtrasRender.ComponentSync.TabPane._defaultTabSpacing);
        this._tabCloseEnabled = this.component.render("tabCloseEnabled", false);
    
        var tabPaneDivElement = document.createElement("div");
        tabPaneDivElement.id = this.component.renderId;
        tabPaneDivElement.style.position = "absolute";
        tabPaneDivElement.style.overflow = "hidden";
    
        this._renderBorderInsets(tabPaneDivElement);
        
        tabPaneDivElement.appendChild(this._renderHeaderContainer());
        tabPaneDivElement.appendChild(this._renderContentContainer());
        
        return tabPaneDivElement;
    },
    
    renderAdd: function(update, parentElement) {
        this._activeTabId = this.component.get("activeTab");
        this._element = this._render();
        
        this._headerContainerTrElement = this._element.childNodes[0].firstChild.rows[0];
        this._contentContainerDivElement = this._element.childNodes[1];
        
        var activeTabFound = false;
        var componentCount = this.component.getComponentCount();
        for (var i = 0; i < componentCount; ++i) {
            var child = this.component.getComponent(i);
            if (this._activeTabId == child.renderId) {
                activeTabFound = true;
            }
            var tab = new ExtrasRender.ComponentSync.TabPane.Tab(child, this);
            this._addTab(update, tab);
        }
        
        if (!activeTabFound) {
            this._activeTabId = null;
            if (componentCount > 0) {
                this._selectTab(this.component.getComponent(0).renderId);
                this.component.set("activeTab", this._activeTabId);
            }
        }
        
        parentElement.appendChild(this._element);
    },
    
    _renderBorderInsets: function(tabPaneDivElement) {
        var pixelInsets = EchoAppRender.Insets.toPixels(this._insets);
        if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_SURROUND) {
            // Do nothing, pixelInsets values are correct.
        } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            pixelInsets.left = pixelInsets.right = 0;
        } else if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
            pixelInsets.left = pixelInsets.right = pixelInsets.top = 0;
        } else {
            pixelInsets.left = pixelInsets.right = pixelInsets.bottom = 0;
        }
        tabPaneDivElement.style.top = pixelInsets.top + "px";
        tabPaneDivElement.style.right = pixelInsets.right + "px";
        tabPaneDivElement.style.bottom = pixelInsets.bottom + "px";
        tabPaneDivElement.style.left = pixelInsets.left + "px";
    },
    
    _renderContentContainer: function() {
        var contentContainerDivElement = document.createElement("div");
        contentContainerDivElement.id = this.component.renderId + "_content";
        contentContainerDivElement.style.position = "absolute";
        contentContainerDivElement.style.overflow = "hidden";
        EchoAppRender.Color.renderFB(this.component, contentContainerDivElement);
        
        if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
            contentContainerDivElement.style.top = "0px";
            contentContainerDivElement.style.bottom = this._tabHeightPx + "px";
        } else {
            contentContainerDivElement.style.top = this._tabHeightPx + "px";
            contentContainerDivElement.style.bottom = "0px";
        }
        contentContainerDivElement.style.left = "0px";
        contentContainerDivElement.style.right = "0px";
        
        if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_NONE) {
            contentContainerDivElement.style.border = "0px none";
        } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_SURROUND) {
            EchoAppRender.Border.render(this._tabActiveBorder, contentContainerDivElement);
        } else if (this._borderType == ExtrasApp.TabPane.BORDER_TYPE_PARALLEL_TO_TABS) {
            EchoAppRender.Border.render(this._tabActiveBorder, contentContainerDivElement, "borderTop")
            EchoAppRender.Border.render(this._tabActiveBorder, contentContainerDivElement, "borderBottom")
        } else if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
            EchoAppRender.Border.render(this._tabActiveBorder, contentContainerDivElement, "borderBottom")
        } else {
            EchoAppRender.Border.render(this._tabActiveBorder, contentContainerDivElement, "borderTop")
        }
        
        return contentContainerDivElement;
    },
    
    renderDispose: function(update) {
        this._activeTabId = null;
        for (var i = 0; i < this._tabs.length; i++) {
            this._tabs[i]._dispose();
        }
        this._tabs = [];
        this._element = null;
        this._headerContainerTrElement = null;
        this._contentContainerDivElement = null;
    },
    
    _renderHeaderContainer: function() {
        var headerContainerDivElement = document.createElement("div");
        headerContainerDivElement.id = this.component.renderId + "_header";
        headerContainerDivElement.style.overflow = "hidden";
        headerContainerDivElement.style.zIndex = 1;
        headerContainerDivElement.style.position = "absolute";
        headerContainerDivElement.style.width = "100%";
        if (this._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
            headerContainerDivElement.style.bottom = "0px";
        } else {
            headerContainerDivElement.style.top = "0px";
        }
        headerContainerDivElement.style.left = this._tabInsetPx + "px";
        headerContainerDivElement.style.right = this._tabInsetPx + "px";
        
        var borderSize = EchoAppRender.Border.getPixelSize(this._tabActiveBorder);
        headerContainerDivElement.style.height = (this._tabHeightPx + borderSize) + "px";
        EchoAppRender.Font.render(this.component.render("font"), headerContainerDivElement);
        EchoAppRender.FillImage.render(this.component.render("tabBackgroundImage"), headerContainerDivElement);
    
        var headerTableElement = document.createElement("table");
        headerTableElement.style.borderWidth = "0px";
        headerTableElement.style.borderCollapse = "collapse";
        headerTableElement.style.padding = "0px";
        
        var headerTbodyElement = document.createElement("tbody");
        headerTableElement.appendChild(headerTbodyElement);
        
        var headerTrElement = document.createElement("tr");
        headerTrElement.id = this.component.renderId + "_header_tr";
        headerTbodyElement.appendChild(headerTrElement);
        
        headerContainerDivElement.appendChild(headerTableElement);
        
        return headerContainerDivElement;
    },
    
    renderDisplay: function() {
        WebCore.VirtualPosition.redraw(this._element);
        WebCore.VirtualPosition.redraw(this._contentContainerDivElement);
        
        for (var i = 0; i < this._tabs.length; ++i) {
            this._tabs[i]._renderDisplay();
        }
    },
    
    renderUpdate: function(update) {
        var fullRender = false;
        if (update.hasUpdatedLayoutDataChildren()) {
            // Layout data children updated: must full render.
            fullRender = true;
        }
        if (!fullRender) {
            if (!Core.Arrays.containsAll(ExtrasRender.ComponentSync.TabPane._supportedPartialProperties, 
                    update.getUpdatedPropertyNames(), true)) {
                // Update contains property changes that cannot be partially re-rendered.
                fullRender = true;
            }
        }
        if (!fullRender) {
            var removedChildren = update.getRemovedChildren();
            if (removedChildren) {
                // Remove children.
                for (var i = 0; i < removedChildren.length; ++i) {
                    var tab = this._getTabById(removedChildren[i].renderId);
                    this._removeTab(tab);
                }
            }
            var addedChildren = update.getAddedChildren();
            if (addedChildren) {
                // Add children.
                for (var i = 0; i < addedChildren.length; ++i) {
                    var tab = new ExtrasRender.ComponentSync.TabPane.Tab(addedChildren[i], this);
                    this._addTab(update, tab, this.component.indexOf(addedChildren[i]));
                }
            }
            if (update.hasUpdatedProperties()) {
                // partial update
                var activeTabUpdate = update.getUpdatedProperty("activeTab");
                if (activeTabUpdate) {
                    this._selectTab(activeTabUpdate.newValue);
                }
            }
        }
    
        // FIXME lazy rendering
        if (fullRender) {
            var element = this._element;
            var containerElement = element.parentNode;
            EchoRender.renderComponentDispose(update, update.parent);
            containerElement.removeChild(element);
            this.renderAdd(update, containerElement);
        }
        return fullRender;
    },
    
    /**
     * Selects a specific tab.
     * 
     * @param tabId {String} the id of the tab to select
     */
    _selectTab: function(tabId) {
        if (tabId == this._activeTabId) {
            return;
        }
        if (this._activeTabId) {
            var tab = this._getTabById(this._activeTabId);
            if (tab) {
                tab._highlight(false);
            }
        }
        
        var tab = this._getTabById(tabId);
        if (tab) {
            this._activeTabId = tabId;
            tab._highlight(true);
        } else {
            this._activeTabId = null;
        }
    },
    
    /**
     * Retrieves the tab instance with the specified tab id.
     * 
     * @param tabId the tab id
     * @return the tab, or null if no tab is present with the specified id
     */
    _getTabById: function(tabId) {
        for (var i = 0; i < this._tabs.length; ++i) {
            var tab = this._tabs[i];
            if (tab._childComponent.renderId == tabId) {
                return tab;
            }
        }
        return null;
    },
    
    /**
     * @param state {Boolean} whether the tab is active or inactive
     * @return the tab height in pixels
     * @type {Number}
     */
    _calculateTabHeight: function(state) {
        if (state) {
            return this._tabHeightPx + EchoAppRender.Border.getPixelSize(this._tabActiveBorder);
        } else {
            return this._tabHeightPx - this._tabActiveHeightIncreasePx;
        }
    }
});

ExtrasRender.ComponentSync.TabPane.Tab = Core.extend({

    $construct: function(childComponent, parent) {
        // state
        this._childComponent = childComponent;
        this._parent = parent;
        this._rendered = false;
        // elements
        this._headerTdElement = null;
        this._headerContentTableElement = null;
        this._contentDivElement = null;
        this._leftTdElement = null;
        this._centerTdElement = null;
        this._rightTdElement = null;
        this._closeImageTdElement = null;
    },
    
    _render: function(update) {
        this._headerTdElement = this._renderHeaderContainer();
        this._headerContentTableElement = this._headerTdElement.firstChild;
        this._contentDivElement = this._renderContentContainer(update);
        
        this._highlight(this._childComponent.renderId == this._parent._activeTabId);
        this._addEventListeners();
    },
    
    _renderHeaderContainer: function() {
        var layoutData = this._childComponent.render("layoutData");
        
        var headerTdElement = document.createElement("td");
        headerTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId;
        headerTdElement.style.borderWidth = "0px";
        headerTdElement.style.padding = "0px";
        
        var headerTableElement = document.createElement("table");
        headerTableElement.style.padding = "0px";
        headerTableElement.cellPadding = "0px";
        headerTableElement.cellSpacing = "0px";
        headerTableElement.style.marginRight = this._parent._tabSpacing.toString();
        var width = this._parent.component.render("tabWidth");
        if (width) {
            headerTableElement.style.width = width.toString();
        }
        
        var headerTbodyElement = document.createElement("tbody");
        var headerTrElement = document.createElement("tr");
        
        // left
        if (this._hasLeftImage()) {
            this._leftTdElement = document.createElement("td");
            this._leftTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId + "_left";
            this._leftTdElement.appendChild(document.createTextNode("\u00a0"));
            headerTrElement.appendChild(this._leftTdElement);
        }
        
        // center
        var centerTdElement = document.createElement("td");
        EchoAppRender.Insets.render(ExtrasRender.ComponentSync.TabPane._defaultTabInsets, centerTdElement, "padding");
        
        var icon = layoutData ? layoutData.icon : null;
        var title = layoutData ? (layoutData.title ? layoutData.title : "*") : "*";
        if (icon || this._parent._tabCloseEnabled) {
            // Render Text and Icon(s)
            var tableElement = document.createElement("table");
            tableElement.style.height = "100%";
            tableElement.cellPadding = "0px";
            tableElement.cellSpacing = "0px";
            tableElement.style.padding = "0px";
            tableElement.style.borderCollapse = "collapse";
            var tbodyElement = document.createElement("tbody");
            var trElement = document.createElement("tr");
            if (icon) {
                trElement.appendChild(this._renderIconElement(icon));
            }
            var textTdElement = document.createElement("td");
            textTdElement.style.whiteSpace = "nowrap";
            EchoAppRender.Alignment.render(this._parent.component.render("tabAlignment", 
                    ExtrasRender.ComponentSync.TabPane._defaultTabAlignment), textTdElement, true, this._parent.component);
            textTdElement.appendChild(document.createTextNode(title));
            tableElement.appendChild(tbodyElement);
            tbodyElement.appendChild(trElement);
            trElement.appendChild(textTdElement);
            if (this._parent._tabCloseEnabled) {
                this._closeImageTdElement = this._renderCloseIconElement();
                trElement.appendChild(this._closeImageTdElement);
            }
            centerTdElement.appendChild(tableElement);
        } else {
            // Render Text Only
            centerTdElement.style.whiteSpace = "nowrap";
            EchoAppRender.Alignment.render(this._parent.component.render("tabAlignment", 
                    ExtrasRender.ComponentSync.TabPane._defaultTabAlignment), centerTdElement, true, this._parent.component);
            centerTdElement.appendChild(document.createTextNode(title));
        }
        headerTrElement.appendChild(centerTdElement);
        this._centerTdElement = centerTdElement;
    
        // right
        if (this._hasRightImage()) {
            this._rightTdElement = document.createElement("td");
            this._rightTdElement.id = this._parent.component.renderId + "_header_td_" + this._childComponent.renderId + "_right";
            this._rightTdElement.appendChild(document.createTextNode("\u00a0"));
            headerTrElement.appendChild(this._rightTdElement);
        }
    
        headerTbodyElement.appendChild(headerTrElement);
        headerTableElement.appendChild(headerTbodyElement);
        headerTdElement.appendChild(headerTableElement);
        
        return headerTdElement;
    },
    
    _renderIconElement: function(icon) {
        var imgTdElement = document.createElement("td");
        EchoAppRender.Alignment.render(this._parent.component.render("tabAlignment", 
                ExtrasRender.ComponentSync.TabPane._defaultTabAlignment), imgTdElement, true, this._parent.component);
        var imgElement = document.createElement("img");
        imgElement.src = EchoAppRender.ImageReference.getUrl(icon);
        imgElement.style.marginRight = this._parent.component.render("tabIconTextMargin", 
                ExtrasRender.ComponentSync.TabPane._defaultTabIconTextMargin + "px");
        imgTdElement.appendChild(imgElement);
        return imgTdElement;
    },
    
    _renderCloseIconElement: function() {
        var imgTdElement = document.createElement("td");
        EchoAppRender.Alignment.render(this._parent.component.render("tabAlignment", 
                ExtrasRender.ComponentSync.TabPane._defaultTabAlignment), imgTdElement, true, this._parent.component);
        imgTdElement.style.padding = "0 0 0 " + this._parent.component.render("tabCloseIconTextMargin", 
                ExtrasRender.ComponentSync.TabPane._defaultTabCloseIconTextMargin + "px");
        imgTdElement.style.cursor = "pointer";
        var imgElement = document.createElement("img");
        imgElement.style.visibility = "hidden";
        var closeImage = this._getCloseImage(false);
        if (!closeImage) {
            closeImage = this._getCloseImage(true);
        }
        if (closeImage) {
            imgElement.src = EchoAppRender.ImageReference.getUrl(closeImage);
        } else {
            imgElement.src = this._parent.client.getResourceUrl("Extras", "image/tabpane/Close.gif");
        }
        
        if (WebCore.Environment.BROWSER_INTERNET_EXPLORER) {
            // remove auto-calculated width & height, to prevent problems with different image sizes
            imgElement.removeAttribute("width");
            imgElement.removeAttribute("height");
        }
        imgTdElement.appendChild(imgElement);
        return imgTdElement;
    },
    
    _renderContentContainer: function(update) {
        var contentDivElement = document.createElement("div");
        contentDivElement.id = this._parent.component.renderId + "_content_" + this._childComponent.renderId;
        contentDivElement.style.position = "absolute";
        contentDivElement.style.top = "0px";
        // hide content
        if (WebCore.Environment.BROWSER_MOZILLA && !WebCore.Environment.BROWSER_FIREFOX) {
            contentDivElement.style.right = "100%";
            contentDivElement.style.bottom = "100%";
        } else {
            contentDivElement.style.display = "none";
            contentDivElement.style.right = "0px";
            contentDivElement.style.bottom = "0px";
        }
        contentDivElement.style.left = "0px";
        EchoAppRender.Insets.render(this._getContentInsets(), contentDivElement, "padding");
        contentDivElement.style.overflow = "auto";
        
        EchoRender.renderComponentAdd(update, this._childComponent, contentDivElement);
        
        return contentDivElement;
    },
    
    _renderDisplay: function() {
        WebCore.VirtualPosition.redraw(this._contentDivElement);
    },
    
    _dispose: function() {
        WebCore.EventProcessor.removeAll(this._headerTdElement);
        
        this._parent = null;
        this._childComponent = null;
        this._headerTdElement = null;
        this._headerContentTableElement = null;
        this._contentDivElement = null;
        this._leftTdElement = null;
        this._centerTdElement = null;
        this._rightTdElement = null;
        this._closeImageTdElement = null;
    },
    
    _highlight: function(state) {
        var headerContentTableElement = this._headerContentTableElement;
        var centerTdElement = this._centerTdElement;
        var contentDivElement = this._contentDivElement;
        
        var foreground;
        var background;
        var border;
        if (state) {
            foreground = this._parent.component.render("tabActiveForeground");
            background = this._parent.component.render("tabActiveBackground");
            border = this._parent._tabActiveBorder;
        } else {
            foreground = this._parent.component.render("tabInactiveForeground");
            background = this._parent.component.render("tabInactiveBackground");
            border = this._parent._tabInactiveBorder;
        }
        EchoAppRender.Color.renderClear(foreground, headerContentTableElement, "color");
        EchoAppRender.Color.renderClear(background, headerContentTableElement, "backgroundColor");
        headerContentTableElement.style.cursor = state ? "default" : "pointer";
        headerContentTableElement.style.height = this._parent._calculateTabHeight(state) + "px";
        
        var backgroundImage;
        if (state) {
            backgroundImage = this._parent.component.render("tabActiveBackgroundImage");
        } else {
            backgroundImage = this._parent.component.render("tabInactiveBackgroundImage");
        }
        EchoAppRender.FillImage.renderClear(backgroundImage, centerTdElement, null);
        
        if (this._parent._tabPosition == ExtrasApp.TabPane.TAB_POSITION_BOTTOM) {
            headerContentTableElement.style.marginTop = state ? "0px" : this._parent._tabActiveBorder.size.toString();
            headerContentTableElement.style.marginBottom = state ? "0px" : this._parent._tabActiveHeightIncreasePx + "px";
            EchoAppRender.Border.render(border, headerContentTableElement, "borderBottom");
        } else {
            headerContentTableElement.style.marginTop = state ? "0px" : this._parent._tabActiveHeightIncreasePx + "px";
            EchoAppRender.Border.render(border, headerContentTableElement, "borderTop");
        }
        EchoAppRender.Border.render(border, headerContentTableElement, "borderLeft");
        EchoAppRender.Border.render(border, headerContentTableElement, "borderRight");
        
        var font;
        if (state) {
            font = this._parent.component.render("tabActiveFont");
        } else {
            font = this._parent.component.render("tabInactiveFont");
        }
        EchoAppRender.Font.renderClear(font, headerContentTableElement);
    
        if (this._leftTdElement) {
            var leftImage = this._getLeftImage(state); 
            EchoAppRender.FillImage.renderClear(leftImage, this._leftTdElement, null);
            if (leftImage && leftImage.width) {
                this._leftTdElement.style.width = leftImage.width.toString();
            }
        }
        
        if (this._rightTdElement) {
            var rightImage = this._getRightImage(state); 
            EchoAppRender.FillImage.renderClear(rightImage, this._rightTdElement, null);
            if (rightImage && rightImage.width) {
                this._rightTdElement.style.width = rightImage.width.toString();
            }
        }
        
        // show/hide content
        if (WebCore.Environment.BROWSER_MOZILLA && !WebCore.Environment.BROWSER_FIREFOX) {
            contentDivElement.style.right = state ? "0px" : "100%";
            contentDivElement.style.bottom = state ? "0px" : "100%";
        } else {
            contentDivElement.style.display = state ? "block" : "none";
        }
        if (state) {
            // FIXME hack to notify the tab content component that it's size may have changed, this is
            // required because any previous notifications could have taken place when this tab was hidden.
            EchoRender.renderComponentDisplay(this._childComponent);
        }
    },
    
    _addEventListeners: function() {
        WebCore.EventProcessor.add(this._headerTdElement, "click", Core.method(this, this._processClick), false);
        WebCore.EventProcessor.Selection.disable(this._headerTdElement);
        
        if (this._closeImageTdElement) {
            WebCore.EventProcessor.add(this._headerTdElement, "mouseover", 
                    Core.method(this, this._processEnter), false);
            WebCore.EventProcessor.add(this._headerTdElement, "mouseout", 
                    Core.method(this, this._processExit), false);
        }
    },
    
    _hasLeftImage: function() {
        return this._getLeftImage(true) != null || this._getLeftImage(false) != null;
    },
    
    _isTabCloseEnabled: function() {
        var layoutData = this._childComponent.render("layoutData");
        return layoutData ? layoutData.closeEnabled : false;
    },
    
    _getLeftImage: function(state) {
        var propertyName = state ? "tabActiveLeftImage" : "tabInactiveLeftImage";
        var image = this._parent.component.render(propertyName);
        if (!image) {
            return;
        }
        var horOffset = 0;
        var verOffset = 0;
        return { url: image, repeat: "no-repeat", x: horOffset, y: verOffset };
    },
    
    _hasRightImage: function() {
        return this._getRightImage(true) != null || this._getRightImage(false) != null;
    },
    
    _getRightImage: function(state) {
        var propertyName = state ? "tabActiveRightImage" : "tabInactiveRightImage";
        var image = this._parent.component.render(propertyName);
        if (!image) {
            return;
        }
        var horOffset = "100%";
        var verOffset = 0;
        return { url: image, repeat: "no-repeat", x: horOffset, y: verOffset };
    },
    
    _getCloseImage: function(rollover) {
        if (this._isTabCloseEnabled()) {
            if (rollover && this._parent.component.render("tabCloseIconRolloverEnabled")) {
                var image = this._parent.component.render("tabRolloverCloseIcon");
                if (image) {
                    return image;
                }
            }
            return this._parent.component.render("tabCloseIcon");
        } else {
            return this._parent.component.render("tabDisabledCloseIcon");
        }
    },
    
    _getContentInsets: function() {
        if (this._childComponent.pane) {
            return ExtrasRender.ComponentSync.TabPane._paneInsets;
        } else {
            return this._parent.component.render("defaultContentInsets", 
                    ExtrasRender.ComponentSync.TabPane._defaultTabContentInsets);
        }
    },
    
    _processClick: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        if (this._closeImageTdElement && WebCore.DOM.isAncestorOf(this._closeImageTdElement, e.target)) {
            // close icon clicked
            if (!this._isTabCloseEnabled()) {
                return;
            }
            this._parent.component.fireEvent({type: "tabClose", source: this._parent.component, 
                    data: this._childComponent.renderId});
        } else {
            // tab clicked
            this._parent._selectTab(this._childComponent.renderId);
            this._parent.component.set("activeTab", this._childComponent.renderId);
            this._parent.component.fireEvent({type: "tabSelect", source: this._parent.component, 
                    data: this._childComponent.renderId});
        }
    },
    
    _processEnter: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
        
        this._closeImageTdElement.firstChild.style.visibility = "visible";
    },
    
    _processExit: function(e) {
        if (!this._parent.component.isActive()) {
            return;
        }
    
        var relTarget = WebCore.DOM.getEventRelatedTarget(e);
        if (relTarget && WebCore.DOM.isAncestorOf(this._headerTdElement, relTarget)) {
            // within tab box
            return;
        }
           
        this._closeImageTdElement.firstChild.style.visibility = "hidden";
    }
});