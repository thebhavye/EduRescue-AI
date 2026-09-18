permit (
    principal,
    action == Action::"apply",
    resource
)
when {
    (resource.eligible_branches.isEmpty() ||
     resource.eligible_branches.contains(principal.branch)) &&

    (resource.eligible_years.isEmpty() ||
     resource.eligible_years.contains(principal.year)) &&

    principal.cgpa10 >= resource.min_cgpa10
};
