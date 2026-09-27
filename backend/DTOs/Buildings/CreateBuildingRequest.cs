using System.ComponentModel.DataAnnotations;

namespace PropertyManagement.Api.DTOs.Buildings;

public class CreateBuildingRequest
{
    [Required(ErrorMessage = "PropertyId is required.")]
    public int PropertyId { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [MaxLength(100, ErrorMessage = "Name must not exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    [Range(0, int.MaxValue, ErrorMessage = "Floors must be a positive number.")]
    public int? Floors { get; set; }
}
