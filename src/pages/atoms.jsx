import "../styles/atom.scss";
import Button from "../ui/atom/Button";
import Input from "../ui/atom/Input";
import Title from "../ui/atom/Tilte";
import DropdownInput from "../ui/atom/DropDown";
import CheckboxInput from "../ui/atom/CheckBox";
import TagsRadio from "../ui/atom/TagsRadio";
import TagCheck from "../ui/atom/TagsCheck";
import TextArea from "../ui/atom/Textarea";
import CountryDropDown from "../ui/atom/CountryDropDown";
import TabCheck from "../ui/atom/Tabs";
import CompactField from "../ui/atom/CompactField";
import Popup, { PopupController } from "../ui/atom/Popup";
import PhotoUploader from "../ui/atom/PhotoUploader";
import { AlertProvider, useAlert } from "../ui/atom/Alert";
import { useState } from "react";
import MenuDropdown from "../ui/atom/MenuDropdown";
import Header from "../ui/compo/Header.jsx";

// Wrap the Atoms component with AlertProvider
const AtomsWithAlerts = () => {
  return (
    <AlertProvider>
      <Atoms />
    </AlertProvider>
  );
};

function Atoms() {
  // Use the alert hook to access alert functions
  const alertManager = useAlert();
  
  // State for counter input test
  const [counterText, setCounterText] = useState('');

  // Function to show alerts
  const showAlert = (type, customMessage = null) => {
    // If customMessage is provided, use it; otherwise, use default message
    alertManager.addAlert(customMessage, type);
  };

  return (
    <>
      <Header />
      
      <div className="home">
        <div className="page-title">
          Atoms
          <br />
          25/10/2025
          
        </div>
        {/* - - - - - - - - - - - PHOTO UPLOADER - - - - - - -  */}
    <div className="main_box">
          <div className="ds_title">PHOTO UPLOADER</div>
          <div className="design-section">
            <PhotoUploader size={150} />
          </div>
        </div>
        <div/>

        {/* - - - - - - - - - - - ALERTS - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">ALERTS</div>
          <div className="design-section">
            <div className="alert-buttons">
              <Button onClick={() => showAlert('success')} className="nav-btn" iconL="ok">Success</Button>
              <Button onClick={() => showAlert('error')} className="nav-btn" iconL="horror">Error</Button>
              <Button onClick={() => showAlert('warning')} className="nav-btn" iconL="hand1">Warning</Button>
              <Button onClick={() => showAlert('info')} className="nav-btn" iconL="name_card">Info</Button>
              <Button onClick={() => showAlert('loading')} className="nav-btn" iconL="loading_ani">Loading</Button>
            </div>
          </div>
        </div>

        {/* - - - - - - - - - - - BUTTONS - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">BUTTONS</div>
          <Button
            iconL="icon07"
            hoverL="icon05"
            iconR="icon02"
            hoverR="icon05"
            to="/home"
          >
            <span> Custom Text </span>
          </Button>

          <Button iconR="icon02" hoverR="icon05" to="/home" className={"lined"}>
            <span> Custom Text </span>
          </Button>

          <Button iconL="icon02" hoverL="icon05" className="sec">
            <span> Custom Text </span>
          </Button>

          <Button className="nav-btn" iconL="icon02" hoverL="icon05">
            <span> HOME </span>
          </Button>
        </div>

        {/* - - - - - - - - - - - MENU DROPDOWN - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">MENU DROPDOWN</div>
          <div className="design-section" style={{display:'flex', gap:'12px'}}>
            <MenuDropdown
              trigger={<Button className="nav-btn" iconL="user_circle"><span>Open Menu</span></Button>}
              items={[
                { label: 'My Card', iconR: 'account', to: '/home' },
                { label: 'Setting', iconR: 'setting', to: '/home' },
                { label: 'Logout', iconR: 'logout', onClick: () => {} },
              ]}
            />
            <MenuDropdown
              defaultOpen={true}
              trigger={<Button className="nav-btn" iconL="user_circle"><span>Always Open</span></Button>}
              items={[
                { label: 'My Card', iconR: 'account' },
                { label: 'Setting', iconR: 'setting' },
                { label: 'Logout', iconR: 'logout' },
              ]}
            />
          </div>
        </div>
        {/* - - - - - - - - - - - INPUTS - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">INPUTS</div>
          <Input
            iconL="cal"
            focusL="flag"
            iconR="pull_up"
            focusR="pull_down" 
            placeholder="Custom Placeholder"
          />
          <Input iconR="cal" focusR="right_arrow" placeholder="Custom Placeholder" />
          <Input iconL="icon04" focusL="icon01" placeholder="Custom Placeholder" prefix="zilapp.com/" />
          
          <CompactField
            iconL="icon04"
            focusL="icon01"
            placeholder="Enter search term"
            buttonText="GO"
            buttonIcon="icon02"
            buttonHoverIcon="icon05"
            className="compact-field with-label"
            label="Search Field"
            prefix={"zilapp.com/"}
          />
          <Input placeholder="Custom Placeholder" label="Custom Label" className="with-label"  />
          <Input 
            placeholder="Type something..." 
            label="Input with Counter" 
            className="with-label"
            value={counterText}
            onChange={(e) => setCounterText(e.target.value)}
            counter={100}
          />
        </div>
        {/* - - - - - - - - - - - DropDown - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">DROPDOWN</div>
          <DropdownInput
            iconL="cal"
            focusL="like"
            iconR="drop_down"
            focusR="drop_up"
            iconRDelete="trash"
            iconRDeleteFocus="trash_ani"
            placeholder="Select"
            className="custom-input"
          >
            <span>Grape</span>
            <span>Mango</span>
            <span>Pineapple</span>
            <span>Strawberry</span>
            <span>Blueberry</span>
            <span>Raspberry</span>
            <span>Kiwi</span>
            <span>Watermelon</span>
            <span>Peach</span>
            <span>Pear</span>
            <span>Plum</span>
            <span>Apricot</span>
            <span>Fig</span>
            <span>Pomegranate</span>
            <span>Lemon</span>
            <span>Lime</span>
            <span>Coconut</span>
            <span>Papaya</span>
            <span>Tangerine</span>
            <span>Nectarine</span>
            <span>Cantaloupe</span>
            <span>Honeydew</span>
            <span>Passionfruit</span>
            <span>Dragonfruit</span>
            <span>Guava</span>
            <span>Lychee</span>
            <span>Persimmon</span>
            <span>Cranberry</span>
            <span>Blackberry</span>
            <span>Mulberry</span>
          </DropdownInput>

          <DropdownInput
            iconR="drop_down"
            focusR="drop_up"
            placeholder="Select"
            className="custom-input"
          >
            <span>Grape</span>
            <span>Mango</span>
            <span>Apple</span>
            <span>Pineapple</span>
            <span>Strawberry</span>
            <span>Blueberry</span>
            <span>Raspberry</span>
            <span>Kiwi</span>
            <span>Watermelon</span>
            <span>Peach</span>
            <span>Pear</span>
            <span>Plum</span>
            <span>Apricot</span>
            <span>Fig</span>
            <span>Pomegranate</span>
            <span>Lemon</span>
            <span>Lime</span>
            <span>Coconut</span>
            <span>Papaya</span>
            <span>Tangerine</span>
            <span>Nectarine</span>
            <span>Cantaloupe</span>
            <span>Honeydew</span>
            <span>Passionfruit</span>
            <span>Dragonfruit</span>
            <span>Guava</span>
            <span>Lychee</span>
            <span>Persimmon</span>
            <span>Cranberry</span>
            <span>Blackberry</span>
            <span>Mulberry</span>
          </DropdownInput>

        </div>

        {/* - - - - - - - - - - - - -Country Dropdown- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">Country Dropdown</div>
          <CountryDropDown 
          placeholder="Select a country...sssss" 
          />
        </div>

        {/* - - - - - - - - - - - CheckBox - - - - - - - -  */}

        <div className="main_box">
          <div className="ds_title">CHECKBOX</div>
          <CheckboxInput
            // label="Check Button"
            iconChecked="ok"
            // iconUnchecked="icon02"
          >
            Text goes here!!
          </CheckboxInput>
        </div>

        {/* - - - - - - - - - - - - TITLES - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">TITLES</div>
          <Title iconName="icon05" className="big-title">
            Big Title
          </Title>
        </div>
        {/* - - - - - - - - - - - - -TAGS Radio- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">TAGS RADIO</div>
          <TagsRadio
            tabs={[
              { icon: "icon01" },
              { name: "Banana", value: "banana" },
              { name: "Orange", value: "orange", icon: "icon04" },
            ]}
          />
        </div>
      {/* - - - - - - - - - - - - -TABS- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">TABS</div>
          <TabCheck
            tabs={[
              { icon: "icon01", value: "icon01" },
              { name: "Banana", value: "banana" },
              { name: "Orange", value: "orange", icon: "icon04" },
            ]}
          />
        </div>
        {/* - - - - - - - - - - - - -TAGS Check- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">TAGS CHECK</div>
          <TagCheck
            tags={[
              { icon: "icon01" },
              { name: "Banana", value: "banana" },
              { name: "Orange", value: "orange", icon: "icon04" },
            ]}
          />
        </div>
        {/* - - - - - - - - - - - - -Textarea- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">TEXTAREA</div>
          <TextArea
            title="Your Message" // Title for the textarea
            iconL="account" // Left icon
            placeholder="Type your text..."
            maxLength={123}
          />
          <TextArea
            title="Your Message" // Title for the textarea
            iconL="account" // Left icon
            placeholder="Type your text..."
            className="compact-textarea"
            maxLength={200}
          />
        </div>
        {/* - - - - - - - - - - - - -Popup- - - - - - - - -  */}
        <div className="main_box">
          <div className="ds_title">POPUP</div>
          <PopupController
            trigger={<Button>Show Popup</Button>}
            title="Important Information"
            text="This is an example popup with some important information. You can add any content here and customize it as needed."
            iconName="zilapp_01"
          >
           
              <Button className="sec">Cancel</Button>
              <Button iconL="ok">Confirm</Button>
          
          </PopupController>
        </div>
      </div>
    </>
  );
}

export default AtomsWithAlerts;
