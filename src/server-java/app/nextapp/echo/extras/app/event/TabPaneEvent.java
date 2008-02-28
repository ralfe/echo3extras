/* 
 * This file is part of the Echo Extras Project.
 * Copyright (C) 2005-2007 NextApp, Inc.
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 */

package nextapp.echo.extras.app.event;

import java.util.EventObject;

/**
 * An event describing an update to the state of a <code>TabPane</code>.
 */
public class TabPaneEvent extends EventObject {
    private int tabIndex;
    
    /**
     * Creates a new <code>TabPaneEvent</code>.
     * 
     * @param source the source of the event
     */
    public TabPaneEvent(Object source) {
        this(source, -1);
    }
    
    /**
     * Creates a new <code>TabPaneEvent</code>.
     * 
     * @param source the source of the event
     * @param tabIndex the tab index on which the event occurred
     */
    public TabPaneEvent(Object source, int tabIndex) {
        super(source);
        this.tabIndex = tabIndex;
    }
    
    /**
     * Returns the index of the tab on which the event occurred.
     * 
     * @return the tab index if the event is tab specific, -1 otherwise.
     */
    public int getTabIndex() {
        return tabIndex;
    }
}
