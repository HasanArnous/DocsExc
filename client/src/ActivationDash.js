import React from "react";

const ActivationDash = (props) =>

     (!props.isActive && props.isExists)?(
        <div>
        <h3>Activate Your Company</h3>
        <button type="button" onClick={props.activateCompany}>Activate !</button>
        <hr />
    </div>
     ):(<p></p>);
        

export default ActivationDash;