import React from "react";



const ActiveCompanyDash = (props) =>
  props.isExists && props.isActive ? (
    <div>
      <h3>Your Public Key:</h3>
      <p>{props.userPK}<br /></p>
      <h3>companies Number: {props.comp_num}</h3>
          Get a Company Details By Index:&nbsp;<input type="text" name="reqCompIndex" value={props.reqCompIndex} onChange={props.handleInputChange}></input>
          &nbsp;<button type="button" onClick={props.getCompDetails}>Get Details!</button>
      <br />
      {props.getCompName}&nbsp;&nbsp;&nbsp;{props.getCompAddress}
      <hr />
      <h3>All Companies </h3>
      <table className="company_table">
        <thead>
          <tr>
            <th>Index</th><th>Company Name</th><th>Account Address</th><th>State</th>
          </tr>

        </thead>
        <tbody>
          {props.comp_table.map((company, i) => (
            <tr key={"comp_tr_" + i}>
              <td>
                {i+1}
              </td>
              <td>
                {company._name}
              </td>
              <td>
                {company._address}
              </td>
              <td>
                {company._active ? "Active" : "Inactive"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <hr />
          Send To:&nbsp;
      <select name="selected_client" onChange={props.handleClientSelect}>
        <option value="empty">Please Select a Client</option>
        {props.comp_table.map((company, i) => (
          company._active ? <option key={company._address} value={company._address}>{company._name}</option> : ""
        ))}
      </select>
      <hr />
      <br />
      <h3>Encryption Block</h3>
        Message:&nbsp;<textarea row="5" name="messToEnc"></textarea>&nbsp;
      <button type="button" onClick={props.encryptMessage}>Encrypt</button>
      <br />
      <button type="button" onClick={props.decryptMessage}>Decrypt</button>
      <br />
      <hr />
      <br />
      <br />
      {((props.is_selected_client) && (props.selected_client_pk !== "")) ? (
        <form method="post" action="#" id="#">
          <input type="file" name="file" onChange={props.inputOnChange} />
        </form>
        ) : ""}

      <button type="button" className="btn btn-success btn-block" onClick={props.upload}>Upload</button> 
    </div>
  ) : (<p></p>);


export default ActiveCompanyDash;