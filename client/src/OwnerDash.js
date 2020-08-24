import React from "react";

const OwnerDash = (props) =>
    props.isOwner ? (
        <div>
            <h3>Register a company</h3>
            <table>
                <tbody>
                    <tr>
                        <td>
                            <label >Company Name:</label>&nbsp;
                        </td>
                        <td>
                            <input type="text" name="comp_name" value={props.comp_name} onChange={props.handleInputChange}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Account Address:</label>&nbsp;
                    </td>
                        <td>
                            <input type="text" name="comp_account" value={props.comp_account} onChange={props.handleInputChange}></input>
                        </td>
                    </tr>
                    <tr>
                        <td>

                        </td>
                        <td colSpan="2" style={{ float: "left" }}>
                            <button type="button" onClick={props.registerCompany}>Register!</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p></p>
            <hr />
        </div>
    ) : (<p></p>);


export default OwnerDash


