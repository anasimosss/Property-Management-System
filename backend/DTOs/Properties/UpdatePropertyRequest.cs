using System.ComponentModel.DataAnnotations;
using PropertyManagement.Api.Entities.Enums;

namespace PropertyManagement.Api.DTOs.Properties;

public class UpdatePropertyRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(200, ErrorMessage = "Name must not exceed 200 characters.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Country is required.")]
    [MaxLength(100, ErrorMessage = "Country must not exceed 100 characters.")]
    public string Country { get; set; } = string.Empty;

    [Required(ErrorMessage = "City is required.")]
    [MaxLength(100, ErrorMessage = "City must not exceed 100 characters.")]
    public string City { get; set; } = string.Empty;

    [MaxLength(100, ErrorMessage = "RegionOrSubCity must not exceed 100 characters.")]
    public string? RegionOrSubCity { get; set; }

    [Required(ErrorMessage = "AddressLine1 is required.")]
    [MaxLength(200, ErrorMessage = "AddressLine1 must not exceed 200 characters.")]
    public string AddressLine1 { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "AddressLine2 must not exceed 200 characters.")]
    public string? AddressLine2 { get; set; }

    [MaxLength(30, ErrorMessage = "PostalCode must not exceed 30 characters.")]
    public string? PostalCode { get; set; }

    [Required(ErrorMessage = "PropertyType is required.")]
    [EnumDataType(typeof(PropertyType), ErrorMessage = "PropertyType must be one of: Residential, Commercial, Mixed.")]
    public PropertyType PropertyType { get; set; }
}
