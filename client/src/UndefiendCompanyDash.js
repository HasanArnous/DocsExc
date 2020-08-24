import React from "react"

const UndefiendCompanyDash = (props) =>
!(props.isActive || props.isExists) && !props.isOwner ? (
    <div><h4>Please Contact The Owner To Register Your Company.</h4></div>
) : (<p></p>);

export default UndefiendCompanyDash;